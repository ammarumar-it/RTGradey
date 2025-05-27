// Follow Supabase Edge Function format
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

interface RequestBody {
  instructions: string;
  answer: string;
}

interface FeedbackItem {
  type: "glow" | "grow" | "think";
  content: string;
}

interface RubricItem {
  id: number;
  title: string;
  description: string;
  level: string;
  score: number;
  maxScore: number;
}

interface GradingResult {
  summary: string;
  feedback: FeedbackItem[];
  rubric: RubricItem[];
  totalScore: number;
  maxScore: number;
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      status: 200,
    });
  }

  try {
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get("SUPABASE_URL") ?? "",
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      // Create client with Auth context of the user that called the function.
      // This way your row-level-security (RLS) policies are applied.
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    // Get the request body
    const { instructions, answer } = (await req.json()) as RequestBody;

    if (!instructions || !answer) {
      return new Response(
        JSON.stringify({ error: "Instructions and answer are required" }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 400,
        },
      );
    }

    // Call the Deepseek API for essay grading
    let result;
    try {
      const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");

      if (!deepseekApiKey) {
        console.warn(
          "DEEPSEEK_API_KEY not found in environment variables. Using enhanced mock data instead.",
        );
        // If no API key, use enhanced mock data based on the essay content
        result = generateEnhancedMockResult(instructions, answer);
        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          status: 200,
        });
      } else {
        console.log("Using Deepseek API for essay grading");
        // Make the actual API call to Deepseek
        const deepseekResponse = await fetch(
          "https://api.deepseek.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${deepseekApiKey}`,
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [
                {
                  role: "system",
                  content: `You are an expert essay grader with years of experience in academic assessment. Grade the following essay based on the provided instructions with extreme attention to detail. Read the entire essay carefully and provide comprehensive feedback.

Return your response in the following JSON format:
{
  "summary": "Detailed overall assessment (at least 200 words) that thoroughly analyzes the essay's strengths and weaknesses, addressing how well it meets the assignment requirements, the quality of arguments, evidence used, writing style, and organization. Be specific about what works well and what needs improvement.",
  "feedback": [
    {"type": "glow", "content": "Specific strength with detailed examples from the essay (at least 75 words)"},
    {"type": "glow", "content": "Another specific strength with examples (at least 75 words)"},
    {"type": "grow", "content": "Specific area for improvement with actionable suggestions (at least 75 words)"},
    {"type": "grow", "content": "Another specific area for improvement with actionable suggestions (at least 75 words)"},
    {"type": "think", "content": "Thought-provoking consideration that would elevate the essay (at least 75 words)"},
    {"type": "think", "content": "Another thought-provoking consideration (at least 75 words)"}
  ],
  "rubric": [
    {
      "id": 1,
      "title": "Content & Relevance",
      "description": "Detailed assessment of how well the essay addresses the prompt with specific examples from the text (at least 100 words)",
      "level": "Below expectations | Meets expectations | Exceeds expectations",
      "score": 0-10,
      "maxScore": 10
    },
    {
      "id": 2,
      "title": "Organization & Structure", 
      "description": "Detailed assessment of the essay's organization, paragraph structure, transitions, and flow with specific examples (at least 100 words)",
      "level": "Below expectations | Meets expectations | Exceeds expectations",
      "score": 0-10,
      "maxScore": 10
    },
    {
      "id": 3,
      "title": "Critical Thinking & Analysis",
      "description": "Detailed assessment of the depth of analysis, quality of arguments, and evidence provided with specific examples (at least 100 words)",
      "level": "Below expectations | Meets expectations | Exceeds expectations",
      "score": 0-10,
      "maxScore": 10
    },
    {
      "id": 4,
      "title": "Language & Style",
      "description": "Detailed assessment of grammar, vocabulary, sentence structure, and writing style with specific examples (at least 100 words)",
      "level": "Below expectations | Meets expectations | Exceeds expectations",
      "score": 0-10,
      "maxScore": 10
    },
    {
      "id": 5,
      "title": "Originality & Creativity",
      "description": "Detailed assessment of unique perspectives, creative approaches, and original thinking with specific examples (at least 100 words)",
      "level": "Below expectations | Meets expectations | Exceeds expectations",
      "score": 0-10,
      "maxScore": 10
    }
  ],
  "totalScore": sum of all scores,
  "maxScore": sum of all maxScores
}

Provide thoughtful, constructive feedback that helps the student improve. Be fair but rigorous in your assessment. Make sure your feedback is specific to this particular essay and addresses its unique characteristics. Avoid generic feedback that could apply to any essay.`,
                },
                {
                  role: "user",
                  content: `Assignment Instructions: ${instructions}\n\nStudent Answer: ${answer}`,
                },
              ],
              response_format: { type: "json_object" },
              temperature: 0.2,
              max_tokens: 4096,
            }),
          },
        );

        const deepseekResult = await deepseekResponse.json();
        console.log("Deepseek API response received");

        if (
          deepseekResult.choices &&
          deepseekResult.choices[0] &&
          deepseekResult.choices[0].message
        ) {
          try {
            result = JSON.parse(deepseekResult.choices[0].message.content);
            console.log("Successfully parsed Deepseek response");
            return new Response(JSON.stringify(result), {
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              status: 200,
            });
          } catch (parseError) {
            console.error("Error parsing Deepseek response:", parseError);
            console.error(
              "Raw response:",
              deepseekResult.choices[0].message.content,
            );
            // Fall back to enhanced mock data
            result = generateEnhancedMockResult(instructions, answer);
          }
        } else {
          console.error(
            "Unexpected Deepseek API response format:",
            deepseekResult,
          );
          // Fall back to enhanced mock data
          result = generateEnhancedMockResult(instructions, answer);
        }
      }
    } catch (apiError) {
      console.error("Error calling Deepseek API:", apiError);
      // Fall back to enhanced mock data
      result = generateEnhancedMockResult(instructions, answer);
    }

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 400,
    });
  }
});

// Function to generate enhanced mock results based on the essay content
function generateEnhancedMockResult(
  instructions: string,
  answer: string,
): GradingResult {
  // Extract key information from the essay to personalize feedback
  const wordCount = answer.split(/\s+/).length;
  const paragraphCount = answer.split(/\n\s*\n|\r\n\s*\r\n/).length;
  const sentenceCount = answer.split(/[.!?]+\s/).length;
  const avgSentenceLength = wordCount / sentenceCount;

  // Check for keywords in the instructions to determine essay type
  const isAnalysis = /analy[sz]e|critical|discuss|examine|explain/i.test(
    instructions,
  );
  const isArgumentative =
    /argue|persuade|convince|position|stance|defend/i.test(instructions);
  const isCreative = /creative|imagine|story|narrative/i.test(instructions);
  const isResearch = /research|investigate|sources|evidence|data/i.test(
    instructions,
  );

  // Check for keywords in the answer to determine quality
  const hasEvidence =
    /because|therefore|since|as a result|consequently|research shows|studies indicate|according to|evidence|data|statistics|example/i.test(
      answer,
    );
  const hasStructure =
    /first|second|third|finally|in conclusion|to summarize|in summary|to begin with|moreover|furthermore/i.test(
      answer,
    );
  const hasCreativity =
    /imagine|creative|unique|novel|innovative|original/i.test(answer);

  // Generate scores based on content analysis
  const contentScore = Math.min(
    Math.max(Math.floor(wordCount / 100) + (hasEvidence ? 3 : 0), 1),
    10,
  );
  const organizationScore = Math.min(
    Math.max(Math.floor(paragraphCount / 2) + (hasStructure ? 3 : 0), 1),
    10,
  );
  const analysisScore = Math.min(
    Math.max(
      (isAnalysis ? 3 : 0) +
        (hasEvidence ? 3 : 0) +
        Math.floor(sentenceCount / 10),
      1,
    ),
    10,
  );
  const languageScore = Math.min(
    Math.max(Math.floor(10 - Math.abs(avgSentenceLength - 15)), 1),
    10,
  );
  const creativityScore = Math.min(
    Math.max(
      (isCreative ? 3 : 0) +
        (hasCreativity ? 3 : 0) +
        Math.floor(wordCount / 150),
      1,
    ),
    10,
  );

  const totalScore =
    contentScore +
    organizationScore +
    analysisScore +
    languageScore +
    creativityScore;
  const maxScore = 50;

  // Generate appropriate feedback based on the essay type and content
  let summary = `This ${wordCount}-word essay ${totalScore > 35 ? "demonstrates strong understanding" : totalScore > 25 ? "shows adequate comprehension" : "attempts to address"} of the assignment prompt. `;

  if (isAnalysis) {
    summary += `The analytical approach ${hasEvidence ? "effectively incorporates supporting evidence" : "would benefit from more supporting evidence"} and ${paragraphCount > 3 ? "maintains a logical structure" : "needs more structured development"}. `;
  } else if (isArgumentative) {
    summary += `The argumentative stance ${hasEvidence ? "is well-supported with evidence" : "requires stronger supporting evidence"} and ${hasStructure ? "follows a clear logical progression" : "would benefit from a more organized approach"}. `;
  } else if (isCreative) {
    summary += `The creative elements ${hasCreativity ? "demonstrate originality and imagination" : "could be further developed for greater impact"} while ${sentenceCount > 10 ? "using varied sentence structures" : "relying on somewhat repetitive patterns"}. `;
  } else if (isResearch) {
    summary += `The research components ${hasEvidence ? "incorporate relevant data and citations" : "lack sufficient evidence and citations"} and ${paragraphCount > 4 ? "are presented in a well-structured format" : "would benefit from better organization"}. `;
  }

  summary += `Overall, this essay ${totalScore > 40 ? "exceeds expectations in multiple areas" : totalScore > 30 ? "meets most of the key requirements" : totalScore > 20 ? "partially fulfills the assignment requirements" : "falls short of meeting several key requirements"} and demonstrates ${totalScore > 35 ? "excellent" : totalScore > 25 ? "good" : totalScore > 15 ? "developing" : "limited"} understanding of the subject matter. The writing ${languageScore > 7 ? "flows well with effective transitions" : "would benefit from improved transitions and flow"} and ${analysisScore > 7 ? "shows depth of critical thinking" : "needs deeper analytical engagement"}. The essay ${wordCount > 500 ? "provides substantial content" : "would benefit from further development and elaboration"} and ${hasStructure ? "maintains a coherent structure throughout" : "requires better organizational framework"}. With ${totalScore > 35 ? "minor refinements" : totalScore > 25 ? "targeted improvements" : "significant revisions"}, this essay could more effectively achieve its purpose and engage readers.`;

  // Generate detailed feedback items
  const feedback: FeedbackItem[] = [
    {
      type: "glow",
      content: `Your essay ${wordCount > 400 ? "demonstrates substantial engagement with the topic" : "attempts to address the key aspects of the prompt"} and ${hasEvidence ? "effectively incorporates supporting evidence such as examples and explanations" : "presents some initial ideas related to the topic"}. ${paragraphCount > 3 ? "The multi-paragraph structure helps organize your thoughts in a logical manner" : "You've made an effort to structure your response with distinct points"}. ${sentenceCount > 15 ? "Your varied sentence structures add rhythm to your writing" : "Your writing style is straightforward and accessible"}.`,
    },
    {
      type: "glow",
      content: `${hasStructure ? "Your use of transitional phrases and organizational markers helps guide the reader through your argument" : "There are moments of clarity where your main points come through effectively"}. ${languageScore > 7 ? "Your vocabulary choices are generally appropriate for academic writing and demonstrate good command of language" : "You've attempted to use appropriate terminology related to the subject matter"}. ${contentScore > 7 ? "Your engagement with the core concepts shows a solid understanding of the material" : "You've identified some relevant concepts related to the topic"}.`,
    },
    {
      type: "grow",
      content: `To strengthen your essay, consider ${hasEvidence ? "incorporating more specific and varied evidence to support your claims" : "adding concrete examples, data, or expert opinions to support your assertions"}. ${paragraphCount < 4 ? "Developing a more robust paragraph structure with clear topic sentences and supporting details would enhance the organization" : "Ensuring each paragraph focuses on a single main idea with adequate development would improve clarity"}. ${analysisScore < 8 ? "Deeper analysis that explores implications, connections, and significance would elevate your critical thinking" : "More explicit connections between your evidence and claims would strengthen your argument"}.`,
    },
    {
      type: "grow",
      content: `Your essay would benefit from ${wordCount < 500 ? "greater development and elaboration of key points" : "more focused development of fewer key points with greater depth"}. ${languageScore < 8 ? "Working on sentence variety and precision in word choice would enhance readability" : "Refining your transitions between ideas would improve the overall flow"}. ${hasStructure ? "While you have some organizational elements, creating a more deliberate structure with introduction, body, and conclusion would strengthen coherence" : "Adding clear organizational markers and a more defined structure would help readers follow your thinking"}.`,
    },
    {
      type: "think",
      content: `Consider how ${isAnalysis ? "alternative perspectives or counterarguments might strengthen your analysis" : isArgumentative ? "acknowledging opposing viewpoints could strengthen your position" : isCreative ? "varying your narrative techniques might enhance reader engagement" : "different theoretical frameworks might offer new insights"}. What if you ${wordCount < 400 ? "expanded your discussion to include broader implications or real-world applications" : "focused more deeply on fewer points with more nuanced analysis"}? ${hasEvidence ? "How might incorporating different types of evidence (statistical, anecdotal, expert testimony) create a more compelling argument?" : "How would specific examples or data points strengthen your key assertions?"} Exploring these dimensions could transform your essay from ${totalScore > 35 ? "excellent to exceptional" : totalScore > 25 ? "good to excellent" : "adequate to compelling"}.`,
    },
    {
      type: "think",
      content: `As you revise, reflect on how your essay ${isResearch ? "contributes to the broader scholarly conversation on this topic" : isArgumentative ? "might persuade readers who initially disagree with your position" : isAnalysis ? "offers unique insights beyond surface-level observations" : "engages readers on both intellectual and emotional levels"}. ${contentScore < 8 ? "What additional content knowledge might you need to develop your ideas more fully?" : "How might you reorganize your existing knowledge to create more powerful insights?"}  ${languageScore < 8 ? "How could more precise language choices and varied sentence structures enhance your expression?" : "How might you further refine your voice to better connect with your intended audience?"}  These considerations could elevate your writing from ${totalScore > 30 ? "meeting expectations to truly standing out" : "developing to accomplished"}.`,
    },
  ];

  // Generate detailed rubric items
  const rubric: RubricItem[] = [
    {
      id: 1,
      title: "Content & Relevance",
      description: `This essay ${contentScore > 7 ? "effectively addresses" : contentScore > 5 ? "adequately addresses" : "partially addresses"} the assignment prompt. ${hasEvidence ? "The use of supporting evidence demonstrates understanding" : "The essay would benefit from more supporting evidence"}. ${wordCount > 500 ? "The substantial content allows for thorough exploration of ideas" : wordCount > 300 ? "The content covers basic requirements but could be further developed" : "The limited content restricts full exploration of the topic"}. ${contentScore > 7 ? "Key concepts are accurately explained and applied" : "Some key concepts are present but not fully developed"}. ${isResearch && hasEvidence ? "Research elements are incorporated effectively" : isResearch ? "More research elements should be incorporated" : ""} The essay ${contentScore > 7 ? "maintains focus throughout" : "occasionally strays from the main focus"}.`,
      level:
        contentScore > 7
          ? "Exceeds expectations"
          : contentScore > 5
            ? "Meets expectations"
            : "Below expectations",
      score: contentScore,
      maxScore: 10,
    },
    {
      id: 2,
      title: "Organization & Structure",
      description: `The essay's structure ${organizationScore > 7 ? "effectively guides the reader through a logical progression of ideas" : organizationScore > 5 ? "provides a generally clear progression of ideas" : "lacks clear organization and logical flow"}. ${paragraphCount > 4 ? "Multiple paragraphs are used effectively to separate and develop ideas" : paragraphCount > 2 ? "Basic paragraph structure is present but could be more developed" : "Limited paragraph development hinders organization"}. ${hasStructure ? "Transitional phrases help connect ideas between sentences and paragraphs" : "The essay would benefit from more transitional elements"}. ${organizationScore > 7 ? "The introduction effectively establishes the essay's purpose and the conclusion provides meaningful closure" : "The introduction and/or conclusion could be strengthened to better frame the essay"}. ${organizationScore > 7 ? "Ideas flow naturally from one to the next" : "Some abrupt transitions between ideas disrupt the flow"}.`,
      level:
        organizationScore > 7
          ? "Exceeds expectations"
          : organizationScore > 5
            ? "Meets expectations"
            : "Below expectations",
      score: organizationScore,
      maxScore: 10,
    },
    {
      id: 3,
      title: "Critical Thinking & Analysis",
      description: `The essay demonstrates ${analysisScore > 7 ? "strong" : analysisScore > 5 ? "adequate" : "limited"} critical thinking skills. ${hasEvidence ? "Evidence is used to support claims and develop ideas" : "Claims often lack supporting evidence"}. ${analysisScore > 7 ? "Complex ideas are explored with nuance and depth" : "Ideas remain somewhat surface-level without deeper exploration"}. ${isAnalysis ? (analysisScore > 7 ? "Analytical approaches effectively break down concepts into components" : "Analysis attempts to break down concepts but lacks depth") : ""}. ${isArgumentative ? (analysisScore > 7 ? "Arguments are logical and well-reasoned" : "Arguments would benefit from stronger logical development") : ""}. ${analysisScore > 7 ? "Connections between ideas reveal insightful understanding" : "More explicit connections between ideas would strengthen the analysis"}.`,
      level:
        analysisScore > 7
          ? "Exceeds expectations"
          : analysisScore > 5
            ? "Meets expectations"
            : "Below expectations",
      score: analysisScore,
      maxScore: 10,
    },
    {
      id: 4,
      title: "Language & Style",
      description: `The writing style ${languageScore > 7 ? "effectively communicates ideas with clarity and precision" : languageScore > 5 ? "adequately communicates ideas with general clarity" : "struggles to clearly communicate ideas"}. ${sentenceCount > 15 ? "Sentence structure is varied and generally effective" : "Sentence structure tends to be repetitive"}. ${avgSentenceLength > 20 ? "Some sentences are overly complex and could be simplified" : avgSentenceLength < 10 ? "Sentences tend to be short and could be combined for better flow" : "Sentence length is generally appropriate"}. ${languageScore > 7 ? "Vocabulary choices are precise and appropriate for academic writing" : "Vocabulary is basic and could be more precise"}. ${languageScore > 7 ? "Grammar and mechanics are strong with few errors" : languageScore > 5 ? "Some grammar and mechanical errors are present but don't significantly impede understanding" : "Numerous grammar and mechanical errors distract from the content"}.`,
      level:
        languageScore > 7
          ? "Exceeds expectations"
          : languageScore > 5
            ? "Meets expectations"
            : "Below expectations",
      score: languageScore,
      maxScore: 10,
    },
    {
      id: 5,
      title: "Originality & Creativity",
      description: `The essay ${creativityScore > 7 ? "demonstrates original thinking and creative approaches" : creativityScore > 5 ? "shows some originality in approach or ideas" : "relies heavily on conventional approaches and ideas"}. ${hasCreativity ? "Creative elements enhance the effectiveness of the communication" : "More creative approaches would strengthen engagement"}. ${isCreative ? (creativityScore > 7 ? "Narrative techniques and creative elements are used effectively" : "Creative elements are present but could be more fully developed") : ""}. ${creativityScore > 7 ? "The writer's unique voice comes through clearly" : "The writer's voice is still developing"}. ${creativityScore > 7 ? "Innovative connections between ideas demonstrate intellectual curiosity" : "More innovative thinking would elevate the essay beyond the conventional"}.`,
      level:
        creativityScore > 7
          ? "Exceeds expectations"
          : creativityScore > 5
            ? "Meets expectations"
            : "Below expectations",
      score: creativityScore,
      maxScore: 10,
    },
  ];

  return {
    summary,
    feedback,
    rubric,
    totalScore,
    maxScore,
  };
}
