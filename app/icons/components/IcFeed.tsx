import * as React from "react";

function SvgIcFeed(props: React.SVGProps<SVGSVGElement>) {
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
          d="M8.128 18c0 .72-.248 1.328-.744 1.824s-1.104.744-1.824.744-1.328-.248-1.824-.744S2.992 18.72 2.992 18s.248-1.328.744-1.824 1.104-.744 1.824-.744 1.328.248 1.824.744.744 1.104.744 1.824zm6.864 1.656a.811.811 0 01-.216.624.845.845 0 01-.648.288h-1.8a.831.831 0 01-.576-.216.79.79 0 01-.264-.552c-.192-2.048-1.016-3.8-2.472-5.256-1.456-1.456-3.208-2.28-5.256-2.472a.79.79 0 01-.552-.264.831.831 0 01-.216-.576v-1.8c0-.256.096-.464.288-.624a.737.737 0 01.576-.24h.072c1.424.112 2.784.472 4.08 1.08a12.486 12.486 0 013.48 2.424 12.037 12.037 0 012.424 3.48c.608 1.312.968 2.68 1.08 4.104zm6.864.024a.775.775 0 01-.24.624.804.804 0 01-.624.264h-1.92a.868.868 0 01-.6-.24c-.176-.16-.264-.344-.264-.552a14.644 14.644 0 00-1.344-5.472c-.8-1.728-1.832-3.232-3.096-4.512C12.504 8.512 11 7.48 9.256 6.696a15.793 15.793 0 00-5.448-1.368.752.752 0 01-.576-.264.84.84 0 01-.24-.576v-1.92c0-.24.088-.448.264-.624.16-.16.36-.24.6-.24h.024c2.352.128 4.592.664 6.72 1.608a18.806 18.806 0 015.712 3.936 18.984 18.984 0 013.936 5.712 18.468 18.468 0 011.608 6.72z"
        />
      </g>
    </svg>
  );
}

export default SvgIcFeed;