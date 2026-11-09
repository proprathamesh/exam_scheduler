
import DashboardLayout, {
  DashboardUser,
  DashboardSection,
} from "./DashboardLayout";

type Props = {
  user: DashboardUser;
  onLogout: () => void | Promise<void>;
};

const sections: DashboardSection[] = [
  {
    title: "Examination Scheduling",
    description: "Generate and manage exam timetables.",
  },
  {
    title: "Room and Seat Allocation",
    description: "Assign rooms and individual student seats.",
  },
  {
    title: "Invigilator Management",
    description: "Allocate faculty to examination duties.",
  },
  {
    title: "AI Scheduling Assistant",
    description: "Generate or modify schedules using prompts.",
  },
  {
    title: "Attendance Monitoring",
    description: "Review attendance records and reports.",
  },
];

export default function AdminDashboard({
  user,
  onLogout,
}: Props) {
  return (
    <DashboardLayout
      user={user}
      title="Admin Dashboard"
      subtitle="Manage university examinations"
      sections={sections}
      onLogout={onLogout}
    />
  );
}
