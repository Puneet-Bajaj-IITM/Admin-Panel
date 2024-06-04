import React, { useEffect } from "react";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Sidebar from "@/Components/sidenav";

const PanelLayout = ({ children }) => {
  const router = useRouter();

  return (
    <div style={{ width: "100vw", minHeight: "100vh" }}>
      <Sidebar>{children}</Sidebar>
    </div>
  );
};

export default PanelLayout;
