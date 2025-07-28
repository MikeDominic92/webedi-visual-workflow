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
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-zinc-400">
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-dark-lg">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-accent-blue" />
            <h3 className="text-lg font-semibold text-white">{workflowTitle}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              aiResponse.overallSuccess
                ? 'bg-status-success/20 text-status-success border border-status-success/30'
                : 'bg-status-error/20 text-status-error border border-status-error/30'
            }`}>
              {aiResponse.overallSuccess ? 'Success' : 'Failed'}
            </span>
            {isOpenRouter && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
                OpenRouter
              </span>
            )}
          </div>
          <div className="text-sm text-zinc-400">
            Total: {formatTime(aiResponse.totalProcessingTime)}
          </div>
        </div>
      </div>

      {/* Stage Status */}
      <div className="p-4 border-b border-zinc-800">
        <div className="grid grid-cols-2 gap-4">
          {/* Stage 1: Parser */}
          <div className="flex items-center gap-3 p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              aiResponse.stage1.success ? 'bg-status-success' : 'bg-status-error'
            }`}>
              {aiResponse.stage1.success ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <XCircle className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="font-medium text-white">
                Stage 1: {isOpenRouter ? 'Gemini 2.0 Flash' : 'Gemini 2.5 Pro'}
              </div>
              <div className="text-sm text-zinc-300">Context Processing & Parsing</div>
              <div className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(aiResponse.stage1.processingTime)}
              </div>
              {isOpenRouter && aiResponse.stage1.model && (
                <div className="text-xs text-accent-blue mt-1">
                  Model: {aiResponse.stage1.model}
                </div>
              )}
            </div>
          </div>

          {/* Stage 2: Generator */}
          <div className="flex items-center gap-3 p-3 bg-accent-purple/10 border border-accent-purple/20 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              aiResponse.stage2?.success ? 'bg-status-success' :
              aiResponse.stage2 ? 'bg-status-error' : 'bg-zinc-600'
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
              <div className="font-medium text-white">
                Stage 2: {isOpenRouter ? 'Kimi K2' : 'Kimi K2 on Groq'}
              </div>
              <div className="text-sm text-zinc-300">Fast Response Generation</div>
              <div className="text-xs text-zinc-400 flex items-center gap-2">
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
                <div className="text-xs text-accent-purple mt-1">
                  Model: {aiResponse.stage2.model}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-800">
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'overview', label: 'Overview', icon: Brain },
            { id: 'responses', label: 'Responses', icon: MessageSquare },
            { id: 'technical', label: 'Technical', icon: Wrench }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors-shadow ${
                activeTab === id
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
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
              <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg">
                <div className="text-sm font-medium text-white">Processing Pipeline</div>
                <div className="text-xs text-zinc-300 mt-1">
                  {isOpenRouter ? (
                    <>Gemini 2.0 Flash → {aiResponse.stage2 ? 'Kimi K2' : 'Stage 2 Skipped'}</>
                  ) : (
                    <>Gemini 2.5 Pro → {aiResponse.stage2 ? 'Kimi K2 on Groq' : 'Stage 2 Skipped'}</>
                  )}
                </div>
              </div>
              <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-lg">
                <div className="text-sm font-medium text-white">Overall Confidence</div>
                <div className="text-xs text-zinc-300 mt-1">
                  {responseGeneration?.confidence ? `${(responseGeneration.confidence * 100).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>

            {isOpenRouter && (
              <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-3">
                <div className="text-sm font-medium text-accent-purple">OpenRouter Unified API</div>
                <div className="text-xs text-accent-purple mt-1">
                  Using OpenRouter for unified access to multiple AI models with optimized routing and cost efficiency.
                </div>
              </div>
            )}

            {aiResponse.stage1.error && (
              <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-3">
                <div className="text-sm font-medium text-status-error">Stage 1 Error</div>
                <div className="text-xs text-status-error/80 mt-1">{aiResponse.stage1.error}</div>
              </div>
            )}

            {aiResponse.stage2?.error && (
              <div className="bg-status-error/10 border border-status-error/20 rounded-lg p-3">
                <div className="text-sm font-medium text-status-error">Stage 2 Error</div>
                <div className="text-xs text-status-error/80 mt-1">{aiResponse.stage2.error}</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'responses' && responseGeneration && (
          <div className="space-y-4">
            <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-accent-blue" />
                <h4 className="font-medium text-white">Customer Response</h4>
              </div>
              <div className="text-sm text-zinc-200 whitespace-pre-wrap">
                {responseGeneration.customerResponse}
              </div>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                <h4 className="font-medium text-white">Internal Documentation</h4>
              </div>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                {responseGeneration.internalDocumentation}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && responseGeneration && (
          <div className="space-y-4">
            <div className="bg-status-success/10 border border-status-success/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-status-success" />
                <h4 className="font-medium text-white">Technical Solutions</h4>
              </div>
              <ul className="space-y-1">
                {responseGeneration.technicalSolutions.map((solution, index) => (
                  <li key={index} className="text-sm text-zinc-200 flex items-start gap-2">
                    <span className="text-status-success mt-1">•</span>
                    <span>{solution}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <List className="w-4 h-4 text-accent-amber" />
                <h4 className="font-medium text-white">Resolution Steps</h4>
              </div>
              <ol className="space-y-1">
                {responseGeneration.resolutionSteps.map((step, index) => (
                  <li key={index} className="text-sm text-zinc-200 flex items-start gap-2">
                    <span className="text-accent-amber font-medium mt-1">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'responses' && !responseGeneration && (
          <div className="text-center py-8 text-zinc-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-zinc-600" />
            <div>No response generation data available</div>
            <div className="text-sm">Stage 2 (Kimi K2) may not have run successfully</div>
          </div>
        )}

        {activeTab === 'technical' && !responseGeneration && (
          <div className="text-center py-8 text-zinc-400">
            <Wrench className="w-12 h-12 mx-auto mb-2 text-zinc-600" />
            <div>No technical solutions available</div>
            <div className="text-sm">Stage 2 (Kimi K2) may not have run successfully</div>
          </div>
        )}
      </div>
    </div>
  );
};
