import numpy as np


def haversine(lat1, lng1, lat2, lng2):
    """
    Vectorized distance between points.
    Accepts floats or numpy arrays.
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

    def free_space_path_loss(self, distance_m):
        """
        Vectorized FSPL calculation.
        """
        distance_m = np.maximum(1.0, distance_m)
        d_km = distance_m / 1000
        f_mhz = self.frequency_ghz * 1000
        return 20 * np.log10(d_km) + 20 * np.log10(f_mhz) + 32.45

    def building_attenuation(self, distance_m, building_density, num_floors=1):
        """
        Vectorized building attenuation.
        """
        walls = building_density * (distance_m / 50)
        wall_loss = self.wall_loss_db * walls
        floor_loss = self.floor_loss_db * np.maximum(0, num_floors - 1)
        return wall_loss + floor_loss

    def calculate_received_power(
        self,
        tx_power_dbm,
        tx_height_m,
        rx_lat,
        rx_lng,
        rx_height_m=1.5,
        tower_lat=None,
        tower_lng=None,
        building_density=0.0,
    ):
        """
        Vectorized Link Budget.
        """
        distance_m = haversine(tower_lat, tower_lng, rx_lat, rx_lng)
        fspl = self.free_space_path_loss(distance_m)
        b_loss = self.building_attenuation(distance_m, building_density)

        height_gain = 10 * np.log10(np.maximum(1, tx_height_m / 10))
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
        rx_height_m=1.5,
    ):
        """
        Vectorized SNR calculation.
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