
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
    title: "My Examination Timetable",
    description: "View upcoming examinations and their dates.",
  },
  {
    title: "Room and Seat Details",
    description: "Check your allocated examination room and seat.",
  },
  {
    title: "Attendance History",
    description: "View your recorded examination attendance.",
  },
];

export default function StudentDashboard({
  user,
  onLogout,
}: Props) {
  return (
    <DashboardLayout
      user={user}
      title="Student Dashboard"
      subtitle="Your personal examination information"
      sections={sections}
      onLogout={onLogout}
    />
  );
}
