import React from 'react';
import { motion } from 'framer-motion';

interface CTAButtonProps {
  onClick: () => void;
  delay?: number;
}

const buttonVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.34, 1.56, 0.64, 1], // bounce easing
    },
  }),
};

export const CTAButton: React.FC<CTAButtonProps> = ({ onClick, delay = 2.4 }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <motion.button
      className="relative px-12 py-4 rounded-full font-semibold text-lg tracking-wide focus:outline-none focus:ring-4 focus:ring-uw-gold-300/60 transition-all"
      style={{
        backgroundColor: isHovered ? 'rgb(var(--uw-gold-300))' : 'rgb(var(--uw-gold))',
        color: isHovered ? 'rgb(var(--uw-purp-700))' : 'rgb(var(--uw-purp-dark))',
        transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isHovered ? 'var(--cta-shadow-hover)' : 'var(--cta-shadow)',
        letterSpacing: '0.02em',
      }}
      variants={buttonVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileTap={{ scale: 0.98 }}
      aria-label="Get Started with Fitted"
    >
      Get Started
    </motion.button>
  );
};
