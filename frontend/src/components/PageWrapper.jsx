import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export default function PageWrapper({ children, title }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="page-header">
          <h1 className="page-title">{title}</h1>
        </div>
      )}
      {children}
    </motion.div>
  );
}