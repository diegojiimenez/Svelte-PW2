from pydantic import BaseModel
from typing import Literal


class UpdateOrderStatusRequest(BaseModel):
    status: Literal["Placed", "In Transit", "Completed", "Cancelled"]
