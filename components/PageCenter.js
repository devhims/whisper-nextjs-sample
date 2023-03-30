import { Center } from '@chakra-ui/react';

const PageCenter = ({ children }) => {
  return (
    <Center
      pos='fixed'
      left='50%'
      top='50%'
      transform='translate(-50%, -50%)'
      flexDirection={'column'}
    >
      {children}
    </Center>
  );
};

export default PageCenter;

//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
