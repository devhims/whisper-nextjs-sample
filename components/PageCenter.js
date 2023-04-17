import { Center } from '@chakra-ui/react';

const PageCenter = ({ children }) => {
  return (
    <Center
      pos='absolute'
      flexDirection={'column'}
      w={'100%'}
      minH={'100vh'}
      p={{ base: '2', md: '4' }}
      overflowY='auto'
      overflowX={'hidden'}
    >
      {children}
    </Center>
  );
};

export default PageCenter;
