import numpy as np


class SignalModel:
    def __init__(
        self,
        frequency_ghz=3.5,
        noise_floor_dbm=-95,
        wall_loss_db=20,
        floor_loss_db=15,
    ):
        self.frequency_ghz = frequency_ghz
        self.noise_floor_dbm = noise_floor_dbm
        self.wall_loss_db = wall_loss_db
        self.floor_loss_db = floor_loss_db

    def free_space_path_loss(self, distance_m):
        """
        FSPL calculation
        """
        if distance_m == 0:
            return 0

        d_km = distance_m / 1000
        f_mhz = self.frequency_ghz * 1000

        return 20 * np.log10(d_km) + 20 * np.log10(f_mhz) + 32.45

    def building_attenuation(self, distance_m, building_density, num_floors=1):
        walls = building_density * (distance_m / 50)
        wall_loss = self.wall_loss_db * walls
        floor_loss = self.floor_loss_db * max(0, num_floors - 1)

        return wall_loss + floor_loss

    def calculate_received_power(
        self,
        tx_power_dbm,
        tx_height_m,
        rx_lat,
        rx_lng,
        tower_lat,
        tower_lng,
        building_density,
    ):
        # Simple distance approximation
        distance = np.sqrt((rx_lat - tower_lat)**2 + (rx_lng - tower_lng)**2) * 111000

        fspl = self.free_space_path_loss(distance)
        b_loss = self.building_attenuation(distance, building_density)

        height_gain = 10 * np.log10(max(1, tx_height_m / 10))

        rx_power = tx_power_dbm - fspl - b_loss + height_gain - 2

        return rx_power

    def calculate_snr(
        self,
        tx_power_dbm,
        tx_height_m,
        rx_lat,
        rx_lng,
        tower_lat,
        tower_lng,
        building_density,
        interference_dbm=0,
    ):
        rx_power = self.calculate_received_power(
            tx_power_dbm,
            tx_height_m,
            rx_lat,
            rx_lng,
            tower_lat,
            tower_lng,
            building_density,
        )

        return rx_power - self.noise_floor_dbm - interference_dbm


if __name__ == "__main__":
    print("Testing propagation.py...")

    model = SignalModel()

    snr = model.calculate_snr(
        tx_power_dbm=30,
        tx_height_m=30,
        rx_lat=34.015,
        rx_lng=71.525,
        tower_lat=34.020,
        tower_lng=71.530,
        building_density=0.3,
    )

    print(f"Sample SNR: {snr:.2f} dB")
    print("propagation.py working ✔")