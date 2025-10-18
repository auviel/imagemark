"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FAQItem } from "@/data/faq"

interface FAQProps {
  items: FAQItem[]
  className?: string
  showAll?: boolean
  maxItems?: number
}

export const FAQ: React.FC<FAQProps> = ({ 
  items, 
  className = "", 
  showAll = false, 
  maxItems = 3 
}) => {
  const [openItems, setOpenItems] = useState<string[]>([])
  
  const displayItems = showAll ? items : items.slice(0, maxItems)
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {displayItems.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 pr-4">
              {item.question}
            </h3>
            {openItems.includes(item.id) ? (
              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}
          </button>
          
          {openItems.includes(item.id) && (
            <div className="px-6 pb-4">
              <p className="text-gray-700 leading-relaxed">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

