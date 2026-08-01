import { RouterProvider } from "react-router-dom";
import { DataProvider } from "./DataProvider";
import { AuthProvider } from "../features/auth/AuthProvider";
import { router } from "../routes/router";

export function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RouterProvider router={router} />
      </DataProvider>
    </AuthProvider>
  );
}
