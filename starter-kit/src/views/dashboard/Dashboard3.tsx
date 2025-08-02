import AnnualProfit from "src/components/dashboards/dashboard3/AnnualProfit";
import RevenueForcastChart from "src/components/dashboards/dashboard3/RevenueForcastChart";
import ColorBoxes from "src/components/dashboards/dashboard3/ColorBoxes";
// import TaskManager from "src/components/apps/kanban/TaskManager";
// import { KanbanDataContextProvider } from "src/context/kanbancontext";
// import CardBox from "src/components/shared/CardBox";

const Dashboard3 = () => {
    return (
        <>
            <div className="grid grid-cols-12 gap-30" style={{ gap: '20px' }}>
                <div className="col-span-12">
                    <ColorBoxes />
                </div>
                <div className="lg:col-span-4 col-span-12">
                    <AnnualProfit />
                </div>
            </div>
        </>
    )
}

export default Dashboard3;