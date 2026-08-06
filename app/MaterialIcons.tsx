import type { CSSProperties, HTMLAttributes } from "react";

type MaterialIconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  size?: number | string;
};

const materialIcon = (symbol: string) => {
  function MaterialIcon({
    className = "",
    size = 24,
    style,
    ...props
  }: MaterialIconProps) {
    const dimension = typeof size === "number" ? `${size}px` : size;
    const iconStyle: CSSProperties = {
      ...style,
      fontSize: dimension,
    };

    return (
      <span
        aria-hidden={props["aria-hidden"] ?? true}
        className={`material-icon ${className}`.trim()}
        style={iconStyle}
        {...props}
      >
        {symbol}
      </span>
    );
  }

  MaterialIcon.displayName = `MaterialIcon(${symbol})`;
  return MaterialIcon;
};

export const ArrowLeft = materialIcon("arrow_back");
export const ArrowRight = materialIcon("arrow_forward");
export const ArrowUpDown = materialIcon("swap_vert");
export const Boxes = materialIcon("inventory_2");
export const ChevronDown = materialIcon("expand_more");
export const CircleCheck = materialIcon("check_circle");
export const CircleX = materialIcon("cancel");
export const Database = materialIcon("database");
export const Dice5 = materialIcon("casino");
export const DollarSign = materialIcon("attach_money");
export const Eye = materialIcon("visibility");
export const Gauge = materialIcon("speed");
export const Home = materialIcon("home");
export const Info = materialIcon("info");
export const LockKeyhole = materialIcon("lock");
export const LogIn = materialIcon("login");
export const PackageOpen = materialIcon("package_2");
export const Pencil = materialIcon("edit");
export const Plus = materialIcon("add");
export const RotateCcw = materialIcon("refresh");
export const Save = materialIcon("save");
export const Search = materialIcon("search");
export const Send = materialIcon("send");
export const Settings = materialIcon("settings");
export const ShieldCheck = materialIcon("verified_user");
export const Sparkles = materialIcon("auto_awesome");
export const Trash2 = materialIcon("delete");
export const TriangleAlert = materialIcon("warning");
export const Trophy = materialIcon("emoji_events");
export const Truck = materialIcon("local_shipping");
export const User = materialIcon("person");
export const UserPlus = materialIcon("person_add");
export const Wallet = materialIcon("account_balance_wallet");
export const X = materialIcon("close");
