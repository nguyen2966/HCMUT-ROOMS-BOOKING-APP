// AdminMenuData.js
import SystemConfig from "../../Components/admin/SystemConfig/SystemConfig";
import UserManage from "../../Components/admin/UserManage/UserManage";
import TimeUsageStatistic from "../../Components/admin/TimeUsageStatistic/TimeUsageStatistic";
import CancellationStatistic from "../../Components/admin/CancellationStatistic/CancellationStatistic";
import RoomOccupancyRates from "../../Components/admin/RoomOccupancyRates/RoomOccupancyRates";
import ViolationStatistics from "../../Components/admin/ViolationStatistics/ViolationStatistics";
import ElectricConsumption from "../../Components/admin/ElectricConsumption/ElectricConsumption";
import IoTPerformance from "../../Components/admin/IoTPerformance/IoTPerformance";
import OperationalCost from "../../Components/admin/OperationalCost/OperationalCost";
import SpaceManage from "../../Components/admin/SpaceManage/SpaceManage";
import FeedbackStatistics from "../../Components/admin/FeedbackStatistics/FeedbackStatistics";

export const adminMenu = [
  {
    name: "System Config",
    description: "Configure system's constant.",
    component: SystemConfig,
  },
  {
    name: "User Manage",
    description: "Manage user.",
    component: UserManage,
  },
  {
    name: "Space Manage",
    description: "Manage rooms",
    component: SpaceManage
  },
  {
    name: "Time usage statistic",
    description: "Show time usage",
    component: TimeUsageStatistic,
  },
  {
    name: "Cancellation/no check-in statistic",
    description: "Number of cancellation/no check-in",
    component: CancellationStatistic,
  },
  {
    name: "Room and building occupancy rates",
    description: "Room/building occupancy rate",
    component: RoomOccupancyRates,
  },
  {
    name: "Violation statistics",
    description: "Violation statistics",
    component: ViolationStatistics,
  },
  {
    name: "Electric consumption",
    description: "Electric consumption by month",
    component: ElectricConsumption,
  },
  {
    name: "IoT devices performance",
    description: "IoT devices performance comparison",
    component: IoTPerformance,
  },
  {
    name: "Operational cost forecast",
    description: "Operational cost forecast by month",
    component: OperationalCost,
  },
  {
    name: "Feedback & Ratings",
    description: "User feedback and satisfaction statistics",
    component: FeedbackStatistics,
  },
];
