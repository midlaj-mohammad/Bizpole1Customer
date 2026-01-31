import React, { useEffect, useRef, useState } from "react";

const adImages = [
  "/Images/adimg.jpg",
  "https://www.bizpolebooks.com/assets/home-cover-BK5kkWyn.jpg",
  "https://www.bizpolebooks.com/assets/login_bg-BnM7ycr7.png"
];

const AdComponent = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % adImages.length);
    }, 3000);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  return (






    
    <div className="relative rounded-2xl overflow-hidden w-full   flex items-center justify-center mt-15">
      <img
        src={adImages[current]}
        alt={`Ad ${current + 1}`}
        className="w-full object-cover rounded-2xl transition-all duration-700"
        style={{ minHeight: '100%', minWidth: '100%' }}
      />
      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {adImages.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${idx === current ? 'bg-yellow-400' : 'bg-white/40'}`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default AdComponent;
