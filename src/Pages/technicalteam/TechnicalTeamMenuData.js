// TechnicalTeamMenuData.js
import ElectricConsumption from "../../Components/admin/ElectricConsumption/ElectricConsumption";
import IoTPerformance from "../../Components/admin/IoTPerformance/IoTPerformance";
import OperationalCost from "../../Components/admin/OperationalCost/OperationalCost";

export const technicalTeamMenu = [
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
];
