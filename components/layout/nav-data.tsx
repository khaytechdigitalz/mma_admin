import React from "react";
import {
  DashboardGridIcon,
  DeliveryBoxIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  AnalyticsIcon,
  TransactionIcon,
  CuponPercentIcon,
  FlashIcon,
  TaxesIcon,
  StructureIcon,
  CustomerSupportIcon,
  SettingsIcon,
  UserIcon,
  SearchListIcon,
  CreditCardPosIcon,
  SettingsAltIcon,
  MoneyBagIcon,
  MoneyIcon,
  MoneyExchangeIcon,
  StarIcon,
  CartRemoveIcon,
  UserSettings,
  SheildIcon,
  SafeDeliveryIcon,
  InvoiceIcon,
  HomeIcon,
  HotPriceIcon,
  StoreIcon,
} from "../../icons";

export type NavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  category?: string;
  items?: NavItem[];
  subItems?: { label: string; href: string; permission?: string }[];
  /**
   * Permission slug (from GET /permissions, e.g. "products.view") required to
   * see this item. Omit for items every logged-in user should see (e.g. "My
   * Account"). Items with no exact match in the current permission list are
   * left unguarded on purpose - see the notes below rather than guessing.
   */
  permission?: string;
};

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: <DashboardGridIcon className="size-5.5" />,
    permission: "dashboard.view",
  },
  {
    label: "Category",
    category: "PRODUCT MANAGEMENT",
    items: [
      {
        label: "Manage Product",
        href: "/products",
        icon: <DeliveryBoxIcon className="size-5.5" />,
        permission: "products.view",
        subItems: [
          { label: "All Products", href: "/products", permission: "products.view" },
          { label: "Add Product", href: "/products/add", permission: "products.create" },
        ],
      },
      {
        label: "Categories & Brands",
        href: "/categories",
        icon: <StructureIcon className="size-5.5" />,
        permission: "categories.view",
        subItems: [
          { label: "Category List", href: "/categories", permission: "categories.view" },
          { label: "Brand List", href: "/categories/brands", permission: "brands.view" },
          { label: "Attribute List", href: "/categories/attributes", permission: "attributes.view" },
        ],
      },
      {
        // No "reviews" group exists in the current permission list - left
        // ungated (visible to anyone who can see this section) until your
        // backend adds one, e.g. "reviews.view".
        label: "Product Review",
        href: "/review",
        icon: <StarIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "ORDER MANAGEMENT",
    items: [
      {
        label: "Orders",
        href: "/orders",
        icon: <ShoppingCartIcon className="size-5.5" />,
        permission: "orders.view",
      },
      {
        label: "Abandoned cart",
        href: "/abandon-cart",
        icon: <CartRemoveIcon className="size-5.5" />,
        permission: "abandoned_carts.view",
      },
      {
        label: "Transactions",
        href: "/transactions",
        icon: <TransactionIcon className="size-5.5" />,
        permission: "transactions.view",
      },
    ],
  },
  {
    label: "Category",
    category: "USER MANAGEMENT",
    items: [
      {
        label: "Admin Users",
        href: "/admin-users",
        icon: <UserSettings className="size-5.5" />,
        permission: "staff.view",
      },
      {
        label: "Roles & Permissions",
        href: "/admin-roles",
        icon: <SheildIcon className="size-5.5" />,
        permission: "roles.view",
      },
      {
        label: "Sellers",
        href: "/sellers",
        icon: <SafeDeliveryIcon className="size-5.5" />,
        permission: "sellers.view",
      },
      {
        label: "Customer",
        href: "/customers",
        icon: <UserGroupIcon className="size-5.5" />,
        permission: "customers.view",
      },
    ],
  },
  {
    label: "Category",
    category: "REPORTS & ANALYTICS",
    items: [
      // No "reports" group in the current permission list - left ungated.
      {
        label: "Sales reports",
        href: "/sales-reports",
        icon: <InvoiceIcon className="size-5.5" />,
      },
      {
        label: "Grossing Products",
        href: "/top-products",
        icon: <AnalyticsIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "FINANCE MANAGEMENT",
    items: [
      {
        label: "Earning",
        href: "/earning",
        icon: <MoneyIcon className="size-5.5" />,
        permission: "platform_earnings.view",
      },
      {
        label: "Withdraws",
        href: "/withdraws",
        icon: <MoneyBagIcon className="size-5.5" />,
        permission: "withdrawals.view",
      },
      {
        label: "Refunds",
        href: "/refunds",
        icon: <MoneyExchangeIcon className="size-5.5" />,
        permission: "refunds.view",
      },
      // No "tax" group in the current permission list - left ungated.
      {
        label: "Tax",
        href: "/tax",
        icon: <TaxesIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "PROMOTIONAL DEALS",
    items: [
      {
        label: "Coupon",
        href: "/coupon",
        icon: <CuponPercentIcon className="size-5.5" />,
        permission: "coupons.view",
      },
      {
        label: "Flash Sales",
        href: "/flash-sales",
        icon: <FlashIcon className="size-5.5" />,
        permission: "flash_sales.view",
      },
    ],
  },
  {
    label: "Category",
    category: "CONTENT MANAGEMENT",
    items: [
      {
        label: "Website Control",
        href: "/website-control",
        icon: <HomeIcon className="size-5.5" />,
        permission: "frontend_contents.view",
      },
      {
        label: "Blog Control",
        href: "/blog-control",
        icon: <HotPriceIcon className="size-5.5" />,
        permission: "frontend_contents.view",
      },
    ],
  },
  {
    label: "Category",
    category: "HELP & SUPPORT",
    items: [
      {
        label: "Support & Ticket",
        href: "/support",
        icon: <CustomerSupportIcon className="size-5.5" />,
        permission: "tickets.view",
      },
    ],
  },
  {
    label: "Category",
    category: "SECURITY",
    items: [
      {
        label: "Audit Log",
        href: "/auditlog",
        icon: <StoreIcon className="size-5.5" />,
        permission: "audit_logs.view",
      },
      {
        // Every logged-in user manages their own account - intentionally
        // not permission-gated.
        label: "My Account",
        href: "/account",
        icon: <UserIcon className="size-5.5" />,
      },
    ],
  },
  {
    label: "Category",
    category: "SETTINGS",
    items: [
      {
        label: "General Settings",
        href: "/settings/general",
        icon: <SettingsIcon className="size-5.5" />,
        permission: "settings.view",
      },
      {
        label: "SEO Settings",
        href: "/settings/seo",
        icon: <SearchListIcon className="size-5.5" />,
        permission: "settings.view",
      },
      {
        label: "Payment API",
        href: "/settings/payment-api",
        icon: <CreditCardPosIcon className="size-5.5" />,
        permission: "settings.view",
      },
      {
        label: "Maintains Settings",
        href: "/settings/maintenance",
        icon: <SettingsAltIcon className="size-5.5" />,
        permission: "settings.view",
      },
    ],
  },
];
