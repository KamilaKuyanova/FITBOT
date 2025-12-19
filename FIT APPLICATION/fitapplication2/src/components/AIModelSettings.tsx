import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Sliders, MessageSquare, Lightbulb, Target, Compass, Ruler, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AIModelSettingsProps {
  onBack: () => void;
}

export function AIModelSettings({ onBack }: AIModelSettingsProps) {
  const [verbosity, setVerbosity] = useState([5]); // 1-10 scale
  const [creativity, setCreativity] = useState([6]); // 1-10 scale
  const [styleFocus, setStyleFocus] = useState("balanced");
  const [recommendationDirection, setRecommendationDirection] = useState("casual");
  const [responseLength, setResponseLength] = useState("medium");
  const [trendy, setTrendy] = useState(false);

  const handleSave = () => {
    // Save settings (will be connected to backend)
    console.log("Saving AI settings:", {
      verbosity: verbosity[0],
      creativity: creativity[0],
      styleFocus,
      recommendationDirection,
      responseLength,
      trendy,
    });
    // Show success message
    alert("AI Model Settings saved successfully!");
  };

  return (
    <div className="min-h-screen pb-28 px-6 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#4A4A4A]" />
          </button>
          <div>
            <h2>AI Model Settings</h2>
            <p className="text-[#8A8A8A]">Customize your style assistant</p>
          </div>
        </div>

        {/* Settings Card */}
        <motion.div
          className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg p-6 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Creativity Level */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-[#C8A2C8]" />
              <Label className="text-base font-medium text-[#4A4A4A]">
                Creativity Level
              </Label>
              <span className="ml-auto text-sm font-medium text-[#C8A2C8]">
                Level {creativity[0]}
              </span>
            </div>
            <div className="px-2">
              <Slider
                value={creativity}
                onValueChange={setCreativity}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-[#8A8A8A]">Conservative</span>
                <span className="text-sm text-[#8A8A8A]">Bold</span>
              </div>
            </div>
            <p className="text-sm text-[#8A8A8A]">
              How creative and experimental the outfit suggestions should be
            </p>
          </div>

          {/* Style Focus */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-5 h-5 text-[#C8A2C8]" />
              <Label className="text-base font-medium text-[#4A4A4A]">
                Style Focus
              </Label>
            </div>
            <Select value={styleFocus} onValueChange={setStyleFocus}>
              <SelectTrigger className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80">
                <SelectValue placeholder="Select style focus" />
              </SelectTrigger>
              <SelectContent className="rounded-[16px] bg-white z-50">
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="edgy">Edgy</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
                <SelectItem value="sporty">Sporty</SelectItem>
                <SelectItem value="chic">Chic</SelectItem>
                <SelectItem value="trendy">Trendy</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-[#8A8A8A]">
              Primary style direction for recommendations
            </p>
          </div>

          {/* Recommendation Direction */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-[#C8A2C8]" />
              <Label className="text-base font-medium text-[#4A4A4A]">
                Recommendation Direction
              </Label>
            </div>
            <Select value={recommendationDirection} onValueChange={setRecommendationDirection}>
              <SelectTrigger className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80">
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent className="rounded-[16px] bg-white z-50">
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="party">Party</SelectItem>
                <SelectItem value="streetwear">Streetwear</SelectItem>
                <SelectItem value="athletic">Athletic</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="weekend">Weekend</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-[#8A8A8A]">
              Needle direction for recommendations
            </p>
          </div>

          {/* Response Length */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-[#C8A2C8]" />
              <Label className="text-base font-medium text-[#4A4A4A]">
                Response Length
              </Label>
            </div>
            <Select value={responseLength} onValueChange={setResponseLength}>
              <SelectTrigger className="rounded-[16px] border-[#C8A2C8]/30 focus:border-[#C8A2C8] focus:ring-[#C8A2C8]/20 bg-white/80">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent className="rounded-[16px] bg-white z-50">
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-[#8A8A8A]">
              Preferred length of AI responses
            </p>
          </div>

          {/* Trend Awareness */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#C8A2C8]" />
              <Label className="text-base font-medium text-[#4A4A4A]">
                Trend Awareness
              </Label>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#8A8A8A]">
                Include current trends in recommendations
              </p>
              <Switch
                checked={trendy}
                onCheckedChange={setTrendy}
                className="data-[state=checked]:bg-[#C8A2C8]"
              />
            </div>
          </div>

          {/* Verbosity Level */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-[#C8A2C8]" />
              <Label className="text-base font-medium text-[#4A4A4A]">
                Response Verbosity
              </Label>
            </div>
            <div className="px-2">
              <Slider
                value={verbosity}
                onValueChange={setVerbosity}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-sm text-[#8A8A8A]">Concise</span>
                <span className="text-sm font-medium text-[#C8A2C8]">
                  Level {verbosity[0]}
                </span>
                <span className="text-sm text-[#8A8A8A]">Detailed</span>
              </div>
            </div>
            <p className="text-sm text-[#8A8A8A]">
              Control how detailed the AI responses are
            </p>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          className="rounded-[24px] bg-gradient-to-br from-[#F5DCE7] to-[#E3F0FF] p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#C8A2C8]" />
            </div>
            <div>
              <h4 className="text-[#4A4A4A] font-medium mb-1">
                About AI Model Settings
              </h4>
              <p className="text-sm text-[#8A8A8A]">
                These settings customize how your AI style assistant responds
                to your queries. Adjust them to match your preferences and get
                the most relevant style advice.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 rounded-[16px] border-[#C8A2C8]/30 text-[#4A4A4A] hover:bg-white/60"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg hover:from-[#B892B8] hover:to-[#D3A8D3] transition-all"
          >
            Save Settings
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

