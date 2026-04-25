import sys
sys.path.append("..")

from data_pipeline.signal.propagation import SignalModel


def test_signal_model_basic():
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

    assert isinstance(snr, float)