// 선 두께 1.8 선 아이콘. 경로는 reference/design 시안에서 그대로 가져왔다.
const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  check: <path d="M4 12l5 5L20 6" />,
  external: <><path d="M14 5h5v5" /><path d="M19 5l-8 8" /><path d="M18 14v5H5V6h5" /></>,
  hanger: <><path d="M12 8a2 2 0 1 1 2-2" /><path d="M12 8v1.5L3 16.5V18h18v-1.5l-9-7" /></>,
  explore: <><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>,
  closet: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M12 3v18M9.5 11v2M14.5 11v2" /></>,
  bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  bookmark: <path d="M7 4h10v16l-5-4-5 4z" />,
};

export type IconName = keyof typeof paths;

interface Props {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, strokeWidth = 1.8 }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
