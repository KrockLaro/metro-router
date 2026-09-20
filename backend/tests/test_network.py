from app.core.network import build_moscow_network, find_route


def test_graph_built():
    net = build_moscow_network()
    assert len(net.stations) > 20
    assert "m_yar" in net.stations


def test_route_fryazino_odin():
    net = build_moscow_network()
    r = find_route(net, "fryazino", "odin")
    assert r is not None
    assert r.total_minutes > 0
    assert len(r.segments) >= 2


def test_route_same_station():
    net = build_moscow_network()
    r = find_route(net, "mytishchi", "mytishchi")
    assert r is not None
    assert r.total_minutes == 0
    assert len(r.segments) == 0