import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

interface CardProps extends BoxProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <Box
      bg="base.100"
      borderRadius="md"
      p={{ base: 6, md: 8 }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default Card;
