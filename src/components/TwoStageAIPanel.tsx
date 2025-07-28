import React, { useState } from 'react';
import { useOpenRouterResponse, useOpenRouterStats, useTwoStageResponse, useResponseGeneration, useAIProcessingStats } from '../store/workflowStore';
import { CheckCircle, XCircle, Clock, Zap, Brain, MessageSquare, FileText, Wrench, List } from 'lucide-react';

export const TwoStageAIPanel: React.FC = () => {
  const openRouterResponse = useOpenRouterResponse();
  const openRouterStats = useOpenRouterStats();
  const twoStageResponse = useTwoStageResponse(); // Legacy fallback
  const responseGeneration = useResponseGeneration();
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'technical'>('overview');

  // Use OpenRouter response if available, otherwise fall back to legacy 2-stage response
  const aiResponse = openRouterResponse || twoStageResponse;
  const stats = openRouterStats;

  if (!aiResponse) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Brain className="w-5 h-5" />
          <span>No AI analysis available</span>
        </div>
      </div>
    );
  }

  const formatTime = (ms: number) => `${ms}ms`;
  const formatTokensPerSec = (tps?: number) => tps ? `${tps} tokens/sec` : 'N/A';

  // Determine if we're using OpenRouter or legacy system
  const isOpenRouter = !!openRouterResponse;
  const workflowTitle = isOpenRouter ? 'OpenRouter AI Workflow' : '2-Stage AI Workflow';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{workflowTitle}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              aiResponse.overallSuccess
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {aiResponse.overallSuccess ? 'Success' : 'Failed'}
            </span>
            {isOpenRouter && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                OpenRouter
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Total: {formatTime(aiResponse.totalProcessingTime)}
          </div>
        </div>
      </div>

      {/* Stage Status */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          {/* Stage 1: Parser */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              aiResponse.stage1.success ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {aiResponse.stage1.success ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <XCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Stage 1: {isOpenRouter ? 'Gemini 2.0 Flash' : 'Gemini 2.5 Pro'}
              </div>
              <div className="text-sm text-gray-600">Context Processing & Parsing</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(aiResponse.stage1.processingTime)}
              </div>
              {isOpenRouter && aiResponse.stage1.model && (
                <div className="text-xs text-blue-600 mt-1">
                  Model: {aiResponse.stage1.model}
                </div>
              )}
            </div>
          </div>

          {/* Stage 2: Generator */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              aiResponse.stage2?.success ? 'bg-green-500' :
              aiResponse.stage2 ? 'bg-red-500' : 'bg-gray-400'
            }`}>
              {aiResponse.stage2?.success ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : aiResponse.stage2 ? (
                <XCircle className="w-5 h-5 text-white" />
              ) : (
                <Clock className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                Stage 2: {isOpenRouter ? 'Claude 3.5 Haiku' : 'Kimi K2 on Groq'}
              </div>
              <div className="text-sm text-gray-600">Fast Response Generation</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {aiResponse.stage2 ? formatTime(aiResponse.stage2.processingTime) : 'N/A'}
                {aiResponse.stage2?.tokensPerSecond && (
                  <>
                    <Zap className="w-3 h-3" />
                    {formatTokensPerSec(aiResponse.stage2.tokensPerSecond)}
                  </>
                )}
              </div>
              {isOpenRouter && aiResponse.stage2?.model && (
                <div className="text-xs text-purple-600 mt-1">
                  Model: {aiResponse.stage2.model}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'overview', label: 'Overview', icon: Brain },
            { id: 'responses', label: 'Responses', icon: MessageSquare },
            { id: 'technical', label: 'Technical', icon: Wrench }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Processing Pipeline</div>
                <div className="text-xs text-gray-600 mt-1">
                  {isOpenRouter ? (
                    <>Gemini 2.0 Flash → {aiResponse.stage2 ? 'Claude 3.5 Haiku' : 'Stage 2 Skipped'}</>
                  ) : (
                    <>Gemini 2.5 Pro → {aiResponse.stage2 ? 'Kimi K2 on Groq' : 'Stage 2 Skipped'}</>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Overall Confidence</div>
                <div className="text-xs text-gray-600 mt-1">
                  {responseGeneration?.confidence ? `${(responseGeneration.confidence * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>

            {isOpenRouter && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-800">OpenRouter Unified API</div>
                <div className="text-xs text-purple-600 mt-1">
                  Using OpenRouter for unified access to multiple AI models with optimized routing and cost efficiency.
                </div>
              </div>
            )}

            {aiResponse.stage1.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800">Stage 1 Error</div>
                <div className="text-xs text-red-600 mt-1">{aiResponse.stage1.error}</div>
              </div>
            )}

            {aiResponse.stage2?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800">Stage 2 Error</div>
                <div className="text-xs text-red-600 mt-1">{aiResponse.stage2.error}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'responses' && responseGeneration && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-900">Customer Response</h4>
              </div>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {responseGeneration.customerResponse}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Internal Documentation</h4>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {responseGeneration.internalDocumentation}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && responseGeneration && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-green-600" />
                <h4 className="font-medium text-green-900">Technical Solutions</h4>
              </div>
              <ul className="space-y-1">
                {responseGeneration.technicalSolutions.map((solution, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <List className="w-4 h-4 text-orange-600" />
                <h4 className="font-medium text-orange-900">Resolution Steps</h4>
              </div>
              <ol className="space-y-1">
                {responseGeneration.resolutionSteps.map((step, index) => (
                  <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                    <span className="text-orange-600 font-medium mt-1">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'responses' && !responseGeneration && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <div>No response generation data available</div>
            <div className="text-sm">Stage 2 (Kimi K2) may not have run successfully</div>
          </div>
        )}

        {activeTab === 'technical' && !responseGeneration && (
          <div className="text-center py-8 text-gray-500">
            <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <div>No technical solutions available</div>
            <div className="text-sm">Stage 2 (Kimi K2) may not have run successfully</div>
          </div>
        )}
      </div>
    </div>
  );
};
