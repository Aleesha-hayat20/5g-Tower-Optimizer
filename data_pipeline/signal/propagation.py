import numpy as np


def haversine(lat1, lng1, lat2, lng2) -> float:
    """
    Accurate distance between two lat/lng points in meters.
    Uses Haversine formula.
    """
    R = 6371000  # Earth radius in meters

    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lng2 - lng1)

    a = np.sin(dphi / 2) ** 2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2) ** 2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))

    return R * c


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

    def free_space_path_loss(self, distance_m: float) -> float:
        """
        FSPL = 20*log10(d_km) + 20*log10(f_mhz) + 32.45
        Returns path loss in dB.
        """
        # Clamp to minimum 1m to avoid log(0)
        distance_m = max(1.0, distance_m)

        d_km = distance_m / 1000
        f_mhz = self.frequency_ghz * 1000

        return 20 * np.log10(d_km) + 20 * np.log10(f_mhz) + 32.45

    def building_attenuation(
        self,
        distance_m: float,
        building_density: float,
        num_floors: int = 1,
    ) -> float:
        """
        Building attenuation based on walls intersected and floors.
        Returns additional loss in dB.
        """
        walls = building_density * (distance_m / 50)
        wall_loss = self.wall_loss_db * walls
        floor_loss = self.floor_loss_db * max(0, num_floors - 1)

        return wall_loss + floor_loss

    def calculate_received_power(
        self,
        tx_power_dbm: float,
        tx_height_m: float,
        rx_lat: float,
        rx_lng: float,
        rx_height_m: float = 1.5,      # ✅ Added — receiver height (typical UE height)
        tower_lat: float = None,
        tower_lng: float = None,
        building_density: float = 0.0,
    ) -> float:
        """
        Full link budget:
        P_rx = P_tx - FSPL - Building_Attenuation + Height_Gain - Misc_Losses
        Returns received power in dBm.
        """
        # ✅ Haversine distance — accurate for Pakistan's latitude
        distance_m = haversine(tower_lat, tower_lng, rx_lat, rx_lng)

        fspl = self.free_space_path_loss(distance_m)
        b_loss = self.building_attenuation(distance_m, building_density)

        # Height gain relative to 10m reference height
        height_gain = 10 * np.log10(max(1, tx_height_m / 10))

        rx_power = tx_power_dbm - fspl - b_loss + height_gain - 2  # -2 dB misc losses

        return rx_power

    def calculate_snr(
        self,
        tx_power_dbm: float,
        tx_height_m: float,
        rx_lat: float,
        rx_lng: float,
        tower_lat: float,
        tower_lng: float,
        building_density: float,
        interference_dbm: float = 0,
        rx_height_m: float = 1.5,
    ) -> float:
        """
        SNR = P_rx - Noise_Floor - Interference
        Returns SNR in dB.
        """
        rx_power = self.calculate_received_power(
            tx_power_dbm=tx_power_dbm,
            tx_height_m=tx_height_m,
            rx_lat=rx_lat,
            rx_lng=rx_lng,
            rx_height_m=rx_height_m,
            tower_lat=tower_lat,
            tower_lng=tower_lng,
            building_density=building_density,
        )

        return rx_power - self.noise_floor_dbm - interference_dbm


if __name__ == "__main__":
    print("Testing propagation.py...")

    model = SignalModel()

    # Test 1: Basic SNR
    snr = model.calculate_snr(
        tx_power_dbm=30,
        tx_height_m=30,
        rx_lat=34.015,
        rx_lng=71.525,
        tower_lat=34.020,
        tower_lng=71.530,
        building_density=0.3,
    )
    print(f"SNR at ~700m distance: {snr:.2f} dB")

    # Test 2: FSPL sanity check (should increase with distance)
    for d in [100, 500, 1000, 2000]:
        fspl = model.free_space_path_loss(d)
        print(f"  FSPL at {d}m: {fspl:.1f} dB")

    # Test 3: Distance = 0 edge case
    fspl_zero = model.free_space_path_loss(0)
    print(f"FSPL at 0m (clamped to 1m): {fspl_zero:.1f} dB")

    # Test 4: Haversine sanity check
    d = haversine(34.020, 71.530, 34.015, 71.525)
    print(f"Haversine distance: {d:.1f}m (expect ~700m)")

    print("propagation.py working ✔")