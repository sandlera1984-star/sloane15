import SidebarLayout from "../../components/SidebarLayout";
import SupportForm from "../../components/SupportForm";

export default function SupportPage() {
  return (
    <SidebarLayout active="support">
      <SupportForm />
    </SidebarLayout>
  );
}
