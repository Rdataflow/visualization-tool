import * as React from "react";

function SvgIcLink(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M13.4 9.186l.707.707c2.33 2.33 2.39 5.933.18 8.328l-.18.186-2.8 2.8c-2.39 2.39-6.124 2.39-8.514 0-2.33-2.33-2.39-5.933-.166-8.34l.18-.188L6.03 9.586l1.385 1.443-3.207 3.078c-1.61 1.61-1.61 4.076 0 5.686 1.556 1.556 3.913 1.608 5.522.155l.164-.155 2.8-2.8c1.556-1.556 1.608-3.913.155-5.522l-.155-.164-.707-.707L13.4 9.186zM9.893 5.593l2.8-2.8c2.39-2.39 6.124-2.39 8.514 0 2.33 2.33 2.39 5.933.166 8.34l-.18.188-3.222 3.093-1.385-1.443 3.207-3.078c1.61-1.61 1.61-4.076 0-5.686-1.556-1.556-3.913-1.608-5.522-.155l-.164.155-2.8 2.8C9.751 8.563 9.7 10.92 11.152 12.53l.155.164.707.707-1.414 1.414-.707-.707c-2.33-2.33-2.39-5.933-.18-8.328l.18-.186 2.8-2.8-2.8 2.8z"
        />
      </g>
    </svg>
  );
}

export default SvgIcLink;