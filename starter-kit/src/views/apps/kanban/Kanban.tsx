
import TaskManager from "src/components/apps/kanban/TaskManager";
import CardBox from "src/components/shared/CardBox";
import { KanbanDataContextProvider } from "src/context/kanbancontext";
import BreadcrumbComp from "src/layouts/full/shared/breadcrumb/BreadcrumbComp";
import LiquidityManager from "src/components/liquidity/LiquidityManager";


const BCrumb = [
    {
        to: "/",
        title: "Home",
    },
    {
        title: "Kanban",
    },
];

function kanban() {
    return (
        <>
            <KanbanDataContextProvider>
                <BreadcrumbComp title="Kanban app" items={BCrumb} />
                <div className="mb-6">
                    <CardBox>
                        <LiquidityManager />
                    </CardBox>
                </div>
                <CardBox>
                    <TaskManager />
                </CardBox>
            </KanbanDataContextProvider>
        </>
    )
}
export default kanban
