
import Card from "@mui/material/Card";
import Profile from "@/components/Settings/Account/Profile"

export default function Page() {
  return (
    <>
      <Card
        sx={{
          boxShadow: "none",
          borderRadius: "10px",
          p: "25px",
          mb: "15px",
        }}
      >
        {/* Profile Content */}
        <Profile />
      </Card>
    </>
  );
}
