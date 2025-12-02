'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Badge,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Link,
  List,
  ListItem,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react';
import { EvidenceSupport, Citation } from '@/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EvidenceGraphProps {
  evidenceData: EvidenceSupport[];
  overallConfidence?: number;
}

interface TooltipData {
  category: string;
  citations: Citation[];
  avgConfidence: number;
  alignmentScore?: number;
  sourceCount: number;
}

const COLORS = ['#1e3a8a', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const ConfidenceBadge: React.FC<{ level: 'high' | 'medium' | 'low'; value: number }> = ({ level, value }) => {
  const colorScheme = {
    high: 'green',
    medium: 'yellow',
    low: 'red',
  };

  return (
    <Badge
      colorScheme={colorScheme[level]}
      fontSize="xs"
      fontWeight="medium"
      px={2}
      py={0.5}
      borderRadius="full"
    >
      {(value * 100).toFixed(0)}%
    </Badge>
  );
};

const CustomPieTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box bg="white" p={3} border="1px" borderColor="gray.300" borderRadius="lg" maxW="xs">
        <Text fontWeight="bold" color="text.primary">{data.category}</Text>
        <Text fontSize="sm" color="text.secondary">
          {data.sourceCount} source{data.sourceCount !== 1 ? 's' : ''}
        </Text>
        <Flex align="center" gap={2} mt={1}>
          <Text fontSize="xs">Confidence:</Text>
          <ConfidenceBadge
            level={data.avgConfidence >= 0.85 ? 'high' : data.avgConfidence >= 0.7 ? 'medium' : 'low'}
            value={data.avgConfidence}
          />
        </Flex>
      </Box>
    );
  }
  return null;
};

const EvidenceGraph: React.FC<EvidenceGraphProps> = ({ evidenceData, overallConfidence }) => {
  const [selectedCategory, setSelectedCategory] = useState<TooltipData | null>(null);

  // Prepare data for pie chart - using source count as the value
  const chartData = useMemo(() => {
    return evidenceData.map((evidence, index) => ({
      name: evidence.category,
      value: Math.max(evidence.sourceCount, 1), // Ensure at least 1 for visibility
      category: evidence.category,
      sourceCount: evidence.sourceCount,
      avgConfidence: evidence.avgConfidence,
      confidenceLevel: evidence.confidenceLevel,
      alignmentScore: evidence.alignmentScore,
      citations: evidence.supportingCitations,
      fill: COLORS[index % COLORS.length],
    }));
  }, [evidenceData]);

  const overallLevel = overallConfidence
    ? overallConfidence >= 0.85 ? 'high' : overallConfidence >= 0.7 ? 'medium' : 'low'
    : 'medium';

  const handlePieClick = (data: any) => {
    setSelectedCategory({
      category: data.category,
      citations: data.citations,
      avgConfidence: data.avgConfidence,
      alignmentScore: data.alignmentScore,
      sourceCount: data.sourceCount,
    });
  };

  return (
    <Box
      bgGradient="linear(to-br, slate.50, blue.50)"
      border="1px"
      borderColor="slate.200"
      p={5}
      borderRadius="md"
      overflow="hidden"
    >
      {/* Header with overall confidence */}
      <Flex align="center" justify="space-between" mb={4}>
        <Flex align="center" gap={2}>
          <Icon boxSize={5} color="blue.600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Icon>
          <Heading as="h4" size="sm" fontWeight="bold" color="slate.800">Evidence Graph</Heading>
        </Flex>
        {overallConfidence !== undefined && (
          <Flex align="center" gap={2}>
            <Text fontSize="sm" color="text.secondary">Overall Confidence:</Text>
            <ConfidenceBadge level={overallLevel} value={overallConfidence} />
          </Flex>
        )}
      </Flex>

      <Text fontSize="sm" color="text.secondary" mb={4}>
        Visual representation of evidence strength per asset class. Click on a segment to see detailed sources.
      </Text>

      {/* Legend for confidence levels */}
      <Flex flexWrap="wrap" gap={4} mb={4} fontSize="xs">
        <Flex align="center" gap={1}>
          <Box w={3} h={3} bg="green.500" borderRadius="sm" />
          <Text>High confidence (≥85%)</Text>
        </Flex>
        <Flex align="center" gap={1}>
          <Box w={3} h={3} bg="yellow.500" borderRadius="sm" />
          <Text>Medium (70-84%)</Text>
        </Flex>
        <Flex align="center" gap={1}>
          <Box w={3} h={3} bg="red.500" borderRadius="sm" />
          <Text>Low (&lt;70%)</Text>
        </Flex>
      </Flex>

      {/* Pie Chart */}
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
              innerRadius={40}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, avgConfidence }) => {
                const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                const confidenceColor = avgConfidence >= 0.85 ? '#22c55e' : avgConfidence >= 0.7 ? '#eab308' : '#ef4444';
                return (
                  <text x={x} y={y} fill={confidenceColor} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="bold">
                    {`${(avgConfidence * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              onClick={handlePieClick}
              style={{ cursor: 'pointer' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>

      {/* Evidence summary cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={3} mt={4}>
        {evidenceData.map((evidence, index) => (
          <GridItem
            key={index}
            p={3}
            borderRadius="md"
            border="2px"
            borderColor={selectedCategory?.category === evidence.category ? 'blue.500' : 'gray.200'}
            bg={selectedCategory?.category === evidence.category ? 'blue.50' : 'white'}
            cursor="pointer"
            transition="all 0.2s"
            minW="0"
            overflow="hidden"
            _hover={{
              borderColor: selectedCategory?.category === evidence.category ? 'blue.500' : 'gray.300'
            }}
            onClick={() => setSelectedCategory({
              category: evidence.category,
              citations: evidence.supportingCitations,
              avgConfidence: evidence.avgConfidence,
              alignmentScore: evidence.alignmentScore,
              sourceCount: evidence.sourceCount,
            })}
          >
            <Flex align="center" gap={2} mb={1}>
              <Box
                w={3}
                h={3}
                borderRadius="full"
                bg={COLORS[index % COLORS.length]}
              />
              <Text fontWeight="medium" fontSize="sm" color="text.primary" isTruncated>{evidence.category}</Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text fontSize="xs" color="text.secondary">
                {evidence.sourceCount} source{evidence.sourceCount !== 1 ? 's' : ''}
              </Text>
              <ConfidenceBadge level={evidence.confidenceLevel} value={evidence.avgConfidence} />
            </Flex>
            {evidence.alignmentScore !== undefined && (
              <Box mt={2}>
                <Flex align="center" justify="space-between" fontSize="xs" color="text.secondary" mb={1}>
                  <Text>Alignment</Text>
                  <Text>{(evidence.alignmentScore * 100).toFixed(0)}%</Text>
                </Flex>
                <Progress value={evidence.alignmentScore * 100} colorScheme="blue" size="sm" borderRadius="full" />
              </Box>
            )}
          </GridItem>
        ))}
      </Grid>

      {/* Selected category detail panel */}
      {selectedCategory && (
        <Box mt={4} p={4} bg="white" border="1px" borderColor="blue.200" borderRadius="md">
          <Flex align="center" justify="space-between" mb={3}>
            <Heading as="h5" size="sm" fontWeight="semibold" color="brand.primary">{selectedCategory.category}</Heading>
            <Button
              onClick={() => setSelectedCategory(null)}
              variant="ghost"
              size="sm"
              color="gray.400"
              _hover={{ color: 'gray.600' }}
            >
              <Icon boxSize={5}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Icon>
            </Button>
          </Flex>

          <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={3}>
            <GridItem bg="gray.50" p={2} borderRadius="md">
              <Text fontSize="xs" color="text.secondary">Sources</Text>
              <Text fontWeight="bold" fontSize="lg">{selectedCategory.sourceCount}</Text>
            </GridItem>
            <GridItem bg="gray.50" p={2} borderRadius="md">
              <Text fontSize="xs" color="text.secondary">Avg Confidence</Text>
              <Text fontWeight="bold" fontSize="lg">{(selectedCategory.avgConfidence * 100).toFixed(0)}%</Text>
            </GridItem>
          </Grid>

          {selectedCategory.alignmentScore !== undefined && (
            <Text fontSize="sm" color="text.secondary" mb={3}>
              Evidence alignment: <Text as="span" fontWeight="bold">{(selectedCategory.alignmentScore * 100).toFixed(0)}%</Text> match between sources and recommendation
            </Text>
          )}

          {selectedCategory.citations.length > 0 ? (
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="text.secondary" textTransform="uppercase" mb={2}>Supporting Sources:</Text>
              <List spacing={2}>
                {selectedCategory.citations.map((citation, idx) => (
                  <ListItem key={idx} fontSize="sm" p={2} bg="gray.50" borderRadius="md">
                    <Flex align="flex-start" gap={2}>
                      <Text color="blue.600" fontWeight="medium">[{idx + 1}]</Text>
                      <Box flex={1} minW={0}>
                        <Link
                          href={citation.uri}
                          isExternal
                          color="blue.600"
                          _hover={{ color: 'blue.800', textDecoration: 'underline' }}
                          display="block"
                          isTruncated
                        >
                          {citation.title}
                        </Link>
                        {citation.confidence !== undefined && (
                          <Text fontSize="xs" color="text.secondary">
                            Confidence: {(citation.confidence * 100).toFixed(0)}%
                          </Text>
                        )}
                      </Box>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            <Text fontSize="sm" color="text.secondary" fontStyle="italic">
              No specific sources identified for this category. Evidence is derived from general market data.
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EvidenceGraph;
