type DucklingSvgProps = {
  className?: string;
  label: string;
};

/** Original inline SVG mascot. It uses no emoji, photographs, or external image assets. */
export function DucklingSvg({ className, label }: DucklingSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 160"
      role="img"
      aria-label={label}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="91" cy="145" rx="48" ry="7" fill="#233b2c" opacity=".10" />
      <path d="M65 128c-2 8-7 12-17 13 8 5 20 4 25-2l2-9m34-2c3 8 9 12 19 12-7 6-20 5-26-1l-2-8" fill="#ef963b" stroke="#c9792c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="91" cy="105" rx="48" ry="39" fill="#f8d65d" stroke="#d6a63b" strokeWidth="3" />
      <path d="M53 103c7-14 20-19 34-15 10 3 17 11 18 22-13 13-36 17-52 5" fill="#f2c94f" stroke="#d6a63b" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="91" cy="59" r="39" fill="#ffe47a" stroke="#d6a63b" strokeWidth="3" />
      <path d="M79 22c-3-8 1-14 8-18 0 7 3 10 7 13 2-7 7-10 13-11-1 9-5 15-12 19" fill="#f8d65d" stroke="#d6a63b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M125 68l27 9-27 10c-5-5-5-14 0-19" fill="#f18a36" stroke="#c9792c" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="104" cy="59" rx="4.4" ry="6" fill="#493a2b" />
      <circle cx="105.5" cy="57" r="1.5" fill="#fff" />
      <ellipse cx="119" cy="79" rx="7" ry="4" fill="#f5a0a0" opacity=".62" />
      <ellipse cx="77" cy="79" rx="7" ry="4" fill="#f5a0a0" opacity=".62" />
      <path d="M75 93c7 5 15 5 22 0" fill="none" stroke="#a66d35" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M133 107c5-4 10-5 14-2" fill="none" stroke="#d6a63b" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
