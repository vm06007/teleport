import RevenueByProduct from "src/components/dashboards/dashboard3/RevenueByProduct";
import TotalSettelment from "src/components/dashboards/dashboard3/TotalSettelment";
import AnnualProfit from "src/components/dashboards/dashboard3/AnnualProfit";
import RevenueForcastChart from "src/components/dashboards/dashboard3/RevenueForcastChart";
import ColorBoxes from "src/components/dashboards/dashboard3/ColorBoxes";
import TaskManager from "src/components/apps/kanban/TaskManager";
import { KanbanDataContextProvider } from "src/context/kanbancontext";
import CardBox from "src/components/shared/CardBox";

const Dashboard3 = () => {
    return (
        <>
        <div className="grid grid-cols-12 gap-30" style={{ gap: '20px' }}>
          <div className="col-span-12">
            <ColorBoxes />
          </div>
          <div className="lg:col-span-8 col-span-12">
            <RevenueForcastChart />
          </div>
          <div className="lg:col-span-4 col-span-12">
            <AnnualProfit />
          </div>
          <div className="lg:col-span-8 col-span-12">
            <RevenueByProduct />
          </div>
          <div className="lg:col-span-4 col-span-12">
            <TotalSettelment />
          </div>
          <div className="col-span-12">
            <KanbanDataContextProvider>
              <CardBox>
                <TaskManager />
              </CardBox>
            </KanbanDataContextProvider>
          </div>
        </div>
      </>
    )
}

export default Dashboard3;