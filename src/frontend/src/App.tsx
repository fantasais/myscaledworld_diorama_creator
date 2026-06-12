import { Layout } from "@/components/Layout";
import { AdminPage } from "@/pages/AdminPage";
import { BuilderPage } from "@/pages/BuilderPage";
import { CartPage } from "@/routes/cart";
import { CheckoutPage } from "@/routes/checkout";
import { ConfirmationPage } from "@/routes/confirmation.$orderId";
import { HomePage } from "@/routes/index";
import { ShopPage } from "@/routes/shop";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: ShopPage,
});

const builderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/builder",
  component: BuilderPage,
});

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

export const confirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/confirmation/$orderId",
  component: ConfirmationPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopRoute,
  builderRoute,
  cartRoute,
  checkoutRoute,
  confirmationRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
