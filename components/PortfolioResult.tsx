'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  List,
  ListItem,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { PortfolioRecommendation, UserProfile, Country, TransparencyMode } from '@/types';
import Card from '@/components/ui/Card';
import TransparencyModeSelector from '@/components/TransparencyModeSelector';
import EvidenceGraph from '@/components/EvidenceGraph';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PortfolioResultProps {
  portfolio: PortfolioRecommendation | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

const COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box bg="white" p={2} border="1px" borderColor="gray.300" borderRadius="md">
        <Text fontWeight="bold">{`${payload[0].name}: ${payload[0].value}%`}</Text>
      </Box>
    );
  }
  return null;
};

const PortfolioResult: React.FC<PortfolioResultProps> = ({ portfolio, userProfile, isLoading, error }) => {
  const [transparencyMode, setTransparencyMode] = useState<TransparencyMode>(TransparencyMode.CITATION_ENHANCED);

  // Get currency symbol based on user's country
  const currencySymbol = useMemo(() => {
    if (!userProfile) return '$';
    switch (userProfile.country) {
      case Country.MALAWI:
        return 'MWK';
      case Country.BOTSWANA:
        return 'BWP';
      default:
        return '$';
    }
  }, [userProfile]);

  const chartData = useMemo(() => {
    return portfolio?.recommended_portfolio.map(p => ({
      name: p.category,
      value: parseFloat(p.allocation),
    })) ?? [];
  }, [portfolio]);

  // Calculate actual amounts if investment amount is provided
  const calculateAmount = (percentage: string) => {
    if (!userProfile?.investmentAmount) return null;
    const amount = userProfile.investmentAmount;
    const percent = parseFloat(percentage) / 100;
    return (amount * percent).toLocaleString();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Flex direction="column" align="center" justify="center" minH="400px">
          <Spinner size="xl" color="brand.primary" thickness="4px" />
          <Text mt={4} color="text.secondary">Analyzing your profile and market data...</Text>
        </Flex>
      );
    }

    if (error) {
      return (
        <Flex direction="column" align="center" justify="center" textAlign="center" minH="400px" bg="red.50" p={4} borderRadius="lg">
          <Text color="red.600" fontWeight="semibold">Error</Text>
          <Text color="red.500" mt={2}>{error}</Text>
        </Flex>
      );
    }

    if (!portfolio) {
      return (
        <Flex direction="column" align="center" justify="center" textAlign="center" minH="400px" bg="gray.50" p={4} borderRadius="lg">
          <Heading as="h3" size="md" color="text.primary">Ready to Build Your Future?</Heading>
          <Text mt={2} color="text.secondary">Fill out your investment profile to get a personalized portfolio recommendation from FinCraft AI.</Text>
        </Flex>
      );
    }

    return (
      <VStack spacing={6} align="stretch">
        {/* Transparency Mode Selector */}
        <TransparencyModeSelector
          selectedMode={transparencyMode}
          onModeChange={setTransparencyMode}
        />

        <Box>
          <Heading as="h3" size="md" color="text.primary">Portfolio Summary</Heading>
          <Text mt={1} fontSize="sm" color="text.secondary">{portfolio.narrative_summary}</Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} textAlign="center">
          <GridItem bg="base.200" p={4} borderRadius="lg">
            <Text fontSize="sm" fontWeight="medium" color="text.secondary">Expected Return</Text>
            <Text fontSize="xl" fontWeight="bold" color="brand.accent">{portfolio.expected_return}</Text>
          </GridItem>
          <GridItem bg="base.200" p={4} borderRadius="lg">
            <Text fontSize="sm" fontWeight="medium" color="text.secondary">Risk Level</Text>
            <Text fontSize="xl" fontWeight="bold" color="text.primary">{portfolio.estimated_risk_level}</Text>
          </GridItem>
          <GridItem bg="base.200" p={4} borderRadius="lg">
            <Text fontSize="sm" fontWeight="medium" color="text.secondary">Horizon</Text>
            <Text fontSize="xl" fontWeight="bold" color="text.primary">{portfolio.investment_horizon}</Text>
          </GridItem>
        </Grid>

        <Box h={{ base: 64, md: 80 }} w="full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  return <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
                    {`${(percent * 100).toFixed(0)}%`}
                  </text>
                }}
              >
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box>
          <Heading as="h3" size="md" color="text.primary" mb={2}>Allocation Breakdown</Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase">Asset Class</Th>
                  <Th fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase">Allocation</Th>
                  <Th fontSize="xs" fontWeight="medium" color="text.secondary" textTransform="uppercase">Reasoning</Th>
                </Tr>
              </Thead>
              <Tbody bg="white">
                {portfolio.recommended_portfolio.map((asset, index) => (
                  <Tr key={index} borderBottom="1px" borderColor="gray.200">
                    <Td fontSize="sm" fontWeight="medium" color="text.primary">{asset.category}</Td>
                    <Td fontSize="sm" color="text.secondary">
                      {asset.allocation}
                      {calculateAmount(asset.allocation) && (
                        <Text display="block" fontSize="xs" color="brand.accent" fontWeight="semibold" mt={1}>
                          {currencySymbol} {calculateAmount(asset.allocation)}
                        </Text>
                      )}
                    </Td>
                    <Td fontSize="sm" color="text.secondary">{asset.reason}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* TRANSPARENCY MODE: CITATION-ENHANCED */}
        {transparencyMode === TransparencyMode.CITATION_ENHANCED && portfolio.citations && portfolio.citations.length > 0 && (
          <Box bg="green.50" border="1px" borderColor="green.200" p={4} borderRadius="lg">
            <Flex align="center" gap={2} mb={3}>
              <Icon boxSize={5} color="green.600">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Icon>
              <Heading as="h4" size="sm" fontWeight="bold" color="green.800">Grounded in Real-Time Data</Heading>
            </Flex>
            <Text fontSize="sm" color="green.700" mb={3}>
              This portfolio recommendation is based on current market data from Google Search.
              {portfolio.searchQueries && portfolio.searchQueries.length > 0 && (
                <Text as="span" display="block" mt={2} fontSize="xs" fontStyle="italic">
                  Search queries: {portfolio.searchQueries.join(', ')}
                </Text>
              )}
            </Text>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="green.800" textTransform="uppercase" mb={2}>Sources:</Text>
              <List spacing={1}>
                {portfolio.citations.map((citation, index) => (
                  <ListItem key={index} fontSize="sm">
                    <Flex align="center" gap={2}>
                      <Link
                        href={citation.uri}
                        isExternal
                        color="blue.600"
                        _hover={{ color: 'blue.800', textDecoration: 'underline' }}
                        flex={1}
                      >
                        <Flex align="center" gap={1}>
                          <Text>[{index + 1}]</Text>
                          <Text isTruncated>{citation.title}</Text>
                          <Icon boxSize={3}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Icon>
                        </Flex>
                      </Link>
                      {citation.confidence !== undefined && (
                        <Badge
                          colorScheme={
                            citation.confidence >= 0.85 ? 'green' :
                            citation.confidence >= 0.7 ? 'yellow' :
                            'red'
                          }
                          fontSize="xs"
                        >
                          {(citation.confidence * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </Box>
          </Box>
        )}

        {/* TRANSPARENCY MODE: SYNTHESIS-TRANSPARENT */}
        {transparencyMode === TransparencyMode.SYNTHESIS_TRANSPARENT && (
          <>
            {/* Model Rationale Section */}
            {portfolio.transparencyMetadata?.modelRationale && (
              <Box bg="purple.50" border="1px" borderColor="purple.200" p={4} borderRadius="lg">
                <Flex align="center" gap={2} mb={3}>
                  <Icon boxSize={5} color="purple.600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </Icon>
                  <Heading as="h4" size="sm" fontWeight="bold" color="purple.800">Model Rationale</Heading>
                </Flex>
                <Text fontSize="sm" color="purple.900" mb={3}>
                  {portfolio.transparencyMetadata.modelRationale.summary}
                </Text>

                {/* Key Factors */}
                {portfolio.transparencyMetadata.modelRationale.keyFactors.length > 0 && (
                  <Box mb={3}>
                    <Text fontSize="xs" fontWeight="semibold" color="purple.800" textTransform="uppercase" mb={2}>Key Factors Considered:</Text>
                    <List spacing={1}>
                      {portfolio.transparencyMetadata.modelRationale.keyFactors.map((factor, idx) => (
                        <ListItem key={idx} fontSize="sm" color="purple.700">
                          <Flex align="flex-start" gap={2}>
                            <Icon boxSize={4} color="purple.500" mt={0.5}>
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                              </svg>
                            </Icon>
                            <Text>{factor}</Text>
                          </Flex>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Exclusions */}
                {portfolio.transparencyMetadata.modelRationale.exclusions &&
                 portfolio.transparencyMetadata.modelRationale.exclusions.length > 0 && (
                  <Box>
                    <Text fontSize="xs" fontWeight="semibold" color="purple.800" textTransform="uppercase" mb={2}>Alternatives Excluded:</Text>
                    <List spacing={1}>
                      {portfolio.transparencyMetadata.modelRationale.exclusions.map((exclusion, idx) => (
                        <ListItem key={idx} fontSize="sm" color="purple.600">
                          <Flex align="flex-start" gap={2}>
                            <Icon boxSize={4} color="purple.400" mt={0.5}>
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </Icon>
                            <Text>{exclusion}</Text>
                          </Flex>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}

            {/* Retrieved Text Segments */}
            {portfolio.transparencyMetadata?.retrievedSegments &&
             portfolio.transparencyMetadata.retrievedSegments.length > 0 && (
              <Box bg="orange.50" border="1px" borderColor="orange.200" p={4} borderRadius="lg">
                <Flex align="center" gap={2} mb={3}>
                  <Icon boxSize={5} color="orange.600">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </Icon>
                  <Heading as="h4" size="sm" fontWeight="bold" color="orange.800">Key Retrieved Text Segments</Heading>
                </Flex>
                <Text fontSize="sm" color="orange.700" mb={3}>
                  These are key excerpts from source documents that informed the recommendation.
                </Text>
                <VStack spacing={3} align="stretch">
                  {portfolio.transparencyMetadata.retrievedSegments.slice(0, 5).map((segment, idx) => (
                    <Box key={idx} bg="white" p={3} borderRadius="md" border="1px" borderColor="orange.100">
                      <Text fontSize="sm" color="gray.700" fontStyle="italic" mb={2}>"{segment.text}"</Text>
                      <Flex align="center" justify="space-between">
                        <Text fontSize="xs" color="orange.600" fontWeight="medium">
                          — {segment.source}{segment.sourceYear ? ` (${segment.sourceYear})` : ''}
                        </Text>
                        {segment.relevanceScore !== undefined && (
                          <Text fontSize="xs" color="text.secondary">
                            Relevance: {(segment.relevanceScore * 100).toFixed(0)}%
                          </Text>
                        )}
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Citations for synthesis mode too */}
            {portfolio.citations && portfolio.citations.length > 0 && (
              <Box bg="gray.50" border="1px" borderColor="gray.200" p={4} borderRadius="lg">
                <Text fontSize="xs" fontWeight="semibold" color="gray.600" textTransform="uppercase" mb={2}>All Sources Referenced:</Text>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={2}>
                  {portfolio.citations.map((citation, index) => (
                    <GridItem key={index} fontSize="sm">
                      <Link
                        href={citation.uri}
                        isExternal
                        color="blue.600"
                        _hover={{ color: 'blue.800', textDecoration: 'underline' }}
                      >
                        <Flex align="center" gap={1}>
                          <Text>[{index + 1}]</Text>
                          <Text isTruncated>{citation.title}</Text>
                        </Flex>
                      </Link>
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}

        {/* TRANSPARENCY MODE: GRAPH-AUGMENTED */}
        {transparencyMode === TransparencyMode.GRAPH_AUGMENTED &&
         portfolio.transparencyMetadata?.evidenceGraph && (
          <EvidenceGraph
            evidenceData={portfolio.transparencyMetadata.evidenceGraph}
            overallConfidence={portfolio.transparencyMetadata.overallConfidence}
          />
        )}

        {/* BASELINE OPAQUE MODE */}
        {transparencyMode === TransparencyMode.BASELINE_OPAQUE && (
          <Box bg="gray.50" border="1px" borderColor="gray.200" p={4} borderRadius="lg">
            <Text fontSize="sm" color="text.secondary" fontStyle="italic">
              Showing baseline view without source attribution or reasoning details.
              Select a different transparency level to see supporting evidence.
            </Text>
          </Box>
        )}

        <Box bg="blue.50" borderLeft="4px" borderColor="brand.secondary" p={4} borderRightRadius="lg">
          <Heading as="h4" size="sm" fontWeight="bold" color="brand.primary">Rebalancing Tip</Heading>
          <Text mt={1} fontSize="sm" color="text.secondary">{portfolio.rebalancing_tip}</Text>
        </Box>
      </VStack>
    );
  };

  return <Card>{renderContent()}</Card>;
};

export default PortfolioResult;
