import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #c9a962 0%, #d4b572 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          fontSize: 14,
          color: '#0a0a0f',
        }}
      >
        ET
      </div>
    ),
    {
      ...size,
    }
  );
}
