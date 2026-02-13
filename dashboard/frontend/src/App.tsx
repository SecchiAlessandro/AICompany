import { Routes, Route } from "react-router-dom";
import { useWebSocket } from "@/hooks/useWebSocket";
import Layout from "@/components/layout/Layout";
import DashboardPage from "@/pages/DashboardPage";
import WorkflowListPage from "@/pages/WorkflowListPage";
import WorkflowBuilderPage from "@/pages/WorkflowBuilderPage";
import ExecutionMonitorPage from "@/pages/ExecutionMonitorPage";
import AgentDetailPage from "@/pages/AgentDetailPage";
import OutputViewerPage from "@/pages/OutputViewerPage";
import HistoryPage from "@/pages/HistoryPage";

export default function App() {
  useWebSocket();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workflows" element={<WorkflowListPage />} />
        <Route path="/workflows/new" element={<WorkflowBuilderPage />} />
        <Route path="/monitor" element={<ExecutionMonitorPage />} />
        <Route path="/monitor/agents/:name" element={<AgentDetailPage />} />
        <Route path="/results" element={<OutputViewerPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Route>
    </Routes>
  );
}
