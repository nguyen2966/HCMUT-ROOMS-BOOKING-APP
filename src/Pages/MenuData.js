// AdminMenuData.js
import UserInfo from "../Components/UserInfo/UserInfo";
import BookedRooms from "../Components/BookedRooms/BookedRooms";


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