'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spinner,
  Text,
  Textarea,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { UserProfile, RiskTolerance, PrimaryGoal, Country, Sector } from '@/types';
import Card from '@/components/ui/Card';
import WandIcon from '@/components/icons/WandIcon';

interface PortfolioFormProps {
  onSubmit: (profile: UserProfile, marketContext: string, fileContent: string) => void;
  isLoading: boolean;
}

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onSubmit, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    country: Country.MALAWI,
    age: '',
    income: '',
    investmentAmount: '',
    horizon: 10,
    riskTolerance: RiskTolerance.BALANCED,
    primaryGoal: PrimaryGoal.GROWTH,
    financialSituation: {
      currentSavings: '',
      monthlyExpenses: '',
      existingInvestments: '',
    },
    preferences: {
      sectors: [],
      esgPreference: false,
      localInternationalSplit: 70, // Default 70% local, 30% international
    },
  });
  const [marketContext, setMarketContext] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Get currency symbol based on selected country
  const currencySymbol = useMemo(() => {
    switch (profile.country) {
      case Country.MALAWI:
        return 'MWK';
      case Country.BOTSWANA:
        return 'BWP';
      default:
        return '$';
    }
  }, [profile.country]);

  const handleProfileChange = useCallback(<K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleFinancialChange = useCallback((key: keyof UserProfile['financialSituation'], value: number | '') => {
    setProfile(prev => ({
      ...prev,
      financialSituation: { ...prev.financialSituation, [key]: value },
    }));
  }, []);

  const handleSectorToggle = useCallback((sector: Sector) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        sectors: prev.preferences.sectors.includes(sector)
          ? prev.preferences.sectors.filter(s => s !== sector)
          : [...prev.preferences.sectors, sector],
      },
    }));
  }, []);

  const handlePreferenceChange = useCallback((key: keyof UserProfile['preferences'], value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value },
    }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      setFileName('');
      setFileContent('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile, marketContext, fileContent);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Location Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={4} color="text.primary">
              Location
            </Heading>
            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                Country <Text as="span" color="red.500">*</Text>
              </FormLabel>
              <Select
                value={profile.country}
                onChange={e => handleProfileChange('country', e.target.value as Country)}
                focusBorderColor="brand.secondary"
              >
                {Object.values(Country).map(val => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </Select>
              <Text mt={1} fontSize="xs" color="gray.500">
                Recommendations will focus on {profile.country === Country.MALAWI ? 'Malawi Stock Exchange (MSE)' : profile.country === Country.BOTSWANA ? 'Botswana Stock Exchange (BSE)' : 'global markets'}
              </Text>
            </FormControl>
          </Box>

          {/* Personal Details Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={4} color="text.primary">
              Your Details
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">Age</FormLabel>
                  <Input
                    type="number"
                    value={profile.age}
                    onChange={e => handleProfileChange('age', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                    min={18}
                    max={100}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Annual Income ({currencySymbol})
                  </FormLabel>
                  <Input
                    type="number"
                    value={profile.income}
                    onChange={e => handleProfileChange('income', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                    min={0}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Investment Details Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={4} color="text.primary">
              Investment Details
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Investment Amount ({currencySymbol})
                  </FormLabel>
                  <Input
                    type="number"
                    value={profile.investmentAmount}
                    onChange={e => handleProfileChange('investmentAmount', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                    min={0}
                    placeholder="How much do you want to invest?"
                  />
                  <Text mt={1} fontSize="xs" color="gray.500">We'll show exact amounts for each allocation</Text>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Investment Horizon (Years) <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Input
                    type="number"
                    value={profile.horizon}
                    min={1}
                    max={50}
                    required
                    onChange={e => handleProfileChange('horizon', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                  />
                </FormControl>
              </GridItem>
            </Grid>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} mt={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Risk Tolerance <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Select
                    value={profile.riskTolerance}
                    onChange={e => handleProfileChange('riskTolerance', e.target.value as RiskTolerance)}
                    focusBorderColor="brand.secondary"
                  >
                    {Object.values(RiskTolerance).map(val => <option key={val} value={val}>{val}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Primary Goal <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Select
                    value={profile.primaryGoal}
                    onChange={e => handleProfileChange('primaryGoal', e.target.value as PrimaryGoal)}
                    focusBorderColor="brand.secondary"
                  >
                    {Object.values(PrimaryGoal).map(val => <option key={val} value={val}>{val}</option>)}
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Financial Situation Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={4} color="text.primary">
              Financial Situation (Optional)
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Current Savings ({currencySymbol})
                  </FormLabel>
                  <Input
                    type="number"
                    value={profile.financialSituation.currentSavings}
                    onChange={e => handleFinancialChange('currentSavings', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                    min={0}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Monthly Expenses ({currencySymbol})
                  </FormLabel>
                  <Input
                    type="number"
                    value={profile.financialSituation.monthlyExpenses}
                    onChange={e => handleFinancialChange('monthlyExpenses', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                    min={0}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                    Existing Investments ({currencySymbol})
                  </FormLabel>
                  <Input
                    type="number"
                    value={profile.financialSituation.existingInvestments}
                    onChange={e => handleFinancialChange('existingInvestments', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    focusBorderColor="brand.secondary"
                    min={0}
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          {/* Investment Preferences Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={4} color="text.primary">
              Investment Preferences
            </Heading>

            {/* Sector Interests */}
            <FormControl mb={4}>
              <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary" mb={2}>
                Sectors of Interest (Select all that apply)
              </FormLabel>
              <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }} gap={2}>
                {Object.values(Sector).map(sector => (
                  <Checkbox
                    key={sector}
                    isChecked={profile.preferences.sectors.includes(sector)}
                    onChange={() => handleSectorToggle(sector)}
                    colorScheme="blue"
                  >
                    <Text fontSize="sm" color="text.secondary">{sector}</Text>
                  </Checkbox>
                ))}
              </Grid>
            </FormControl>

            {/* ESG Preference */}
            <Checkbox
              isChecked={profile.preferences.esgPreference}
              onChange={e => handlePreferenceChange('esgPreference', e.target.checked)}
              colorScheme="blue"
              mb={4}
            >
              <Text fontSize="sm" fontWeight="medium" color="text.secondary">
                Prefer ESG/Sustainable Investments
              </Text>
            </Checkbox>

            {/* Local vs International Split */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary" mb={2}>
                Local vs International Preference: {profile.preferences.localInternationalSplit}% Local
              </FormLabel>
              <Slider
                value={profile.preferences.localInternationalSplit}
                onChange={value => handlePreferenceChange('localInternationalSplit', value)}
                min={0}
                max={100}
                colorScheme="blue"
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg="brand.primary" />
                </SliderTrack>
                <SliderThumb boxSize={6} />
              </Slider>
              <Flex justify="space-between" fontSize="xs" color="gray.500" mt={1}>
                <Text>All International</Text>
                <Text>Balanced</Text>
                <Text>All Local</Text>
              </Flex>
            </FormControl>
          </Box>

          {/* Market Context Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={2} color="text.primary">
              Market Context
            </Heading>
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium" color="text.secondary">
                Provide current market trends, news, or data (optional)
              </FormLabel>
              <Text fontSize="xs" color="gray.500" mb={2}>
                Real-time data about {profile.country} markets will be automatically fetched using Google Search
              </Text>
              <Textarea
                value={marketContext}
                onChange={e => setMarketContext(e.target.value)}
                rows={4}
                focusBorderColor="brand.secondary"
                placeholder={`e.g., Focus on ${profile.country === Country.MALAWI ? 'Malawi Stock Exchange' : profile.country === Country.BOTSWANA ? 'Botswana mining sector' : 'emerging markets'}, currency trends...`}
              />
            </FormControl>
          </Box>

          {/* File Upload Section */}
          <Box>
            <Heading as="h3" size="md" borderBottom="1px" borderColor="gray.200" pb={2} mb={2} color="text.primary">
              Spending Data (Optional)
            </Heading>
            <FormLabel
              htmlFor="file-upload"
              cursor="pointer"
              borderRadius="lg"
              bg="white"
              fontWeight="medium"
              color="brand.secondary"
              _hover={{ color: 'brand.primary' }}
            >
              <Flex
                align="center"
                justify="center"
                w="full"
                h={32}
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="lg"
              >
                <Box textAlign="center">
                  <Text mt={1} fontSize="sm" color="gray.600">
                    <Text as="span" fontWeight="semibold">Upload a file</Text> or drag and drop
                  </Text>
                  <Text fontSize="xs" color="gray.500">TXT, CSV, or other text files</Text>
                  {fileName && <Text fontSize="xs" color="brand.accent" mt={2}>{fileName}</Text>}
                </Box>
              </Flex>
              <Input id="file-upload" name="file-upload" type="file" display="none" onChange={handleFileChange} />
            </FormLabel>
          </Box>

          <Button
            type="submit"
            isLoading={isLoading}
            loadingText="Crafting Portfolio..."
            w="full"
            colorScheme="blue"
            bg="brand.primary"
            color="white"
            _hover={{ bg: 'brand.secondary' }}
            size="lg"
            leftIcon={!isLoading ? <WandIcon className="w-5 h-5" /> : undefined}
          >
            Generate Portfolio
          </Button>
        </VStack>
      </form>
    </Card>
  );
};

export default PortfolioForm;
