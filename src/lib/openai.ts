import OpenAI from 'openai';

export interface BusinessReport {
  overallScore: number;
  sections: {
    title: string;
    score: number;
    priority: 'high' | 'medium' | 'low';
    recommendations: {
      action: string;
      details: string;
      impact: 'high' | 'medium' | 'low';
      effort: string;
      implementation: string[];
    }[];
  }[];
  summary: {
    overview: string;
    strengths: string[];
    opportunities: string[];
    actionPlan: {
      immediate: {
        task: string;
        expectedImpact: string;
      }[];
      shortTerm: {
        task: string;
        expectedImpact: string;
      }[];
    };
  };
}

const ANALYSIS_PROMPT = `As an expert in local business optimization and digital marketing, analyze this Google Business Profile comprehensively. Consider:

1. Profile Completeness & Accuracy
- Evaluate the completeness of business information
- Assess accuracy and consistency of data
- Check for keyword optimization in business name and category

2. Visual Content & Presentation
- Analyze photo quantity and quality
- Evaluate visual content diversity
- Assess business appearance representation

3. Customer Engagement & Reviews
- Analyze rating patterns and review sentiment
- Evaluate review response rate and quality
- Identify common customer feedback themes

4. Local SEO & Visibility
- Assess local search optimization
- Evaluate category selection and relevance
- Check for location-based optimization

5. Competitive Analysis
- Compare against industry standards
- Identify competitive advantages
- Highlight areas for differentiation

6. Trust & Credibility Signals
- Evaluate business verification status
- Assess professional presentation
- Review trust-building elements

For each area:
1. Provide a detailed score and justification
2. Identify specific strengths and weaknesses
3. Offer actionable, prioritized recommendations
4. Include step-by-step implementation guidance
5. Estimate potential impact and effort required

Business Details:
Name: {{businessName}}
Category: {{category}}
Rating: {{rating}}
Reviews: {{reviewCount}}
Profile Status: {{claimed}}
Website: {{website}}
Phone: {{phone}}
Hours Listed: {{hasHours}}
Photos Count: {{photoCount}}

Provide a structured analysis focusing on immediate impact opportunities and long-term optimization strategies.`;

export async function generateBusinessReport(
  business: {
    name: string;
    category: string;
    rating: number;
    reviews_count?: number;
    claimed?: boolean;
    website?: string;
    phone?: string;
    hours?: Record<string, string>;
    photos?: string[];
  },
  apiKey: string
): Promise<BusinessReport> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    // Replace placeholders in prompt
    const prompt = ANALYSIS_PROMPT
      .replace('{{businessName}}', business.name)
      .replace('{{category}}', business.category)
      .replace('{{rating}}', business.rating.toString())
      .replace('{{reviewCount}}', (business.reviews_count || 'Unknown').toString())
      .replace('{{claimed}}', business.claimed ? 'Claimed' : 'Unclaimed')
      .replace('{{website}}', business.website || 'Not listed')
      .replace('{{phone}}', business.phone || 'Not listed')
      .replace('{{hasHours}}', business.hours ? 'Yes' : 'No')
      .replace('{{photoCount}}', (business.photos?.length || 0).toString());

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert digital marketing analyst specializing in Google Business Profile optimization. Provide detailed, actionable analysis with specific recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }

    // Calculate profile completeness score
    const requiredElements = ['website', 'phone', 'hours'];
    const presentElements = requiredElements.filter(elem => business[elem]);
    const completenessScore = (presentElements.length / requiredElements.length) * 100;

    // Generate the report structure
    const report: BusinessReport = {
      overallScore: Math.round((business.rating * 20) + completenessScore) / 2,
      sections: [
        {
          title: "Profile Completeness",
          score: Math.round(completenessScore),
          priority: completenessScore < 60 ? 'high' : completenessScore < 80 ? 'medium' : 'low',
          recommendations: requiredElements
            .filter(elem => !business[elem])
            .map(missing => ({
              action: `Add ${missing} information`,
              details: `Your business profile is missing ${missing} information which is crucial for visibility and customer trust.`,
              impact: 'high',
              effort: 'low',
              implementation: [
                `Gather your business ${missing} information`,
                `Log into Google Business Profile`,
                `Add ${missing} in the appropriate section`,
                'Verify information accuracy'
              ]
            }))
        },
        {
          title: "Customer Reviews",
          score: Math.round(business.rating * 20),
          priority: business.rating < 4.0 ? 'high' : business.rating < 4.5 ? 'medium' : 'low',
          recommendations: [
            {
              action: "Improve review management",
              details: "Actively manage and respond to customer reviews to improve rating and engagement.",
              impact: 'high',
              effort: 'medium',
              implementation: [
                'Set up review monitoring',
                'Respond to all reviews within 24 hours',
                'Address negative feedback professionally',
                'Encourage satisfied customers to leave reviews'
              ]
            }
          ]
        }
      ],
      summary: {
        overview: `${business.name} has a ${business.rating} star rating with ${business.reviews_count || 'unknown'} reviews. The profile is ${business.claimed ? 'claimed' : 'unclaimed'} and shows ${Math.round(completenessScore)}% completeness.`,
        strengths: [
          business.claimed && 'Profile is claimed and verified',
          business.rating >= 4.0 && 'Strong overall rating',
          business.reviews_count && business.reviews_count > 20 && 'Good number of reviews',
          business.website && 'Website link provided',
          business.hours && 'Business hours listed'
        ].filter(Boolean) as string[],
        opportunities: [
          !business.claimed && 'Claim and verify business profile',
          !business.website && 'Add website link',
          !business.hours && 'Add business hours',
          (!business.photos?.length || business.photos.length < 5) && 'Add more photos',
          business.rating < 4.0 && 'Improve overall rating',
          (!business.reviews_count || business.reviews_count < 20) && 'Generate more reviews'
        ].filter(Boolean) as string[],
        actionPlan: {
          immediate: [
            {
              task: business.claimed ? 
                "Review and update all profile information" : 
                "Claim and verify business profile",
              expectedImpact: "Improved visibility and credibility"
            },
            {
              task: "Set up review management system",
              expectedImpact: "Better customer engagement and ratings"
            }
          ],
          shortTerm: [
            {
              task: "Implement review generation strategy",
              expectedImpact: "Increased review count and improved rating"
            },
            {
              task: "Add missing profile elements",
              expectedImpact: "Enhanced profile completeness"
            }
          ]
        }
      }
    };

    return report;
  } catch (error) {
    console.error('Error generating business report:', error);
    throw error;
  }
}

// Rest of the file remains unchanged
export interface OptimizationAdvice {
  // ... existing interface
}

export async function generateOptimizationAdvice(
  // ... existing function
) {
  // ... existing implementation
}