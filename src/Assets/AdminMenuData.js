// AdminMenuData.js
import AdminInfo from "../Components/admin/AdminInfo/AdminInfo";
import SystemConfig from "../Components/admin/SystemConfig/SystemConfig";
import UserManage from "../Components/admin/UserManage/UserManage";
import TimeUsageStatistic from "../Components/admin/TimeUsageStatistic/TimeUsageStatistic";
import CancellationStatistic from "../Components/admin/CancellationStatistic/CancellationStatistic";
import RoomOccupancyRates from "../Components/admin/RoomOccupancyRates/RoomOccupancyRates";
import ViolationStatistics from "../Components/admin/ViolationStatistics/ViolationStatistics";
import SpaceManage from "../Components/admin/SpaceManage/SpaceMange"
import UserInfo from "../Components/UserInfo/UserInfo";
import BookedRooms from "../Components/BookedRooms/BookedRooms";


export const adminMenu = [
  {
    name: "Admin Info",
    description: "View or change your information.",
    component: AdminInfo,
  },
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
];



export const userMenu = [
  {
    name: "User Info",
    description: "View or change your information.",
    component: UserInfo,
  },
  {
    name: "Your Rooms",
    description: "View your Booked Rooms.",
    component: BookedRooms,
  }
];
