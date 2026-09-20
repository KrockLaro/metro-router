from datetime import date, datetime

import pytest

from app.gtfs.loader import GTFSFeed
from app.gtfs.raptor import RaptorIndex, raptor


pytest.skip("Требует GTFS-фид", allow_module_level=True)