'use client';

import { useState, useCallback } from 'react';
import { Box, Container, Heading, Text, Grid, GridItem } from '@chakra-ui/react';
import PortfolioForm from '@/components/PortfolioForm';
import PortfolioResult from '@/components/PortfolioResult';
import { UserProfile, PortfolioRecommendation } from '@/types';

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioRecommendation | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (profile: UserProfile, marketContext: string, fileContent: string) => {
    setIsLoading(true);
    setError(null);
    setPortfolio(null);
    setUserProfile(profile); // Store the profile for display

    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile,
          marketContext,
          spendingData: fileContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate portfolio');
      }

      const result: PortfolioRecommendation = await response.json();
      setPortfolio(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Box minH="100vh" bg="base.200" color="text.primary">
      <Box as="header" bg="brand.primary">
        <Container maxW="1400px" px={4} py={5}>
          <Heading as="h1" size="lg" color="white">FinCraft AI</Heading>
          <Text fontSize="sm" color="blue.200">Your Personalized Portfolio Architect</Text>
        </Container>
      </Box>

      <Container as="main" maxW="1400px" p={{ base: 4, md: 8 }}>
        <Grid templateColumns={{ base: '1fr', lg: '600px 1fr' }} gap={8}>
          <GridItem minW="0">
            <Heading as="h2" size="md" mb={4} color="text.primary">Investment Profile</Heading>
            <PortfolioForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </GridItem>
          <GridItem minW="0">
            <Heading as="h2" size="md" mb={4} color="text.primary">AI-Generated Portfolio</Heading>
            <PortfolioResult portfolio={portfolio} userProfile={userProfile} isLoading={isLoading} error={error} />
          </GridItem>
        </Grid>
      </Container>

      <Box as="footer" textAlign="center" py={6} color="text.secondary" fontSize="sm">
        <Text>Disclaimer: FinCraft AI provides recommendations for informational purposes only and does not constitute financial advice.</Text>
        <Text>&copy; {new Date().getFullYear()} FinCraft AI. All rights reserved.</Text>
      </Box>
    </Box>
  );
}
