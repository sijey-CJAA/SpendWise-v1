import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { WeekData } from '../utils/dateGrouping';

interface SpreadsheetCalendarProps {
  weeks: WeekData[];
}

export default function SpreadsheetCalendar({ weeks }: SpreadsheetCalendarProps) {
  if (weeks.length === 0) {
    return (
      <View className="py-8 items-center justify-center">
        <Text className="text-on-surface-variant">No activity this month</Text>
      </View>
    );
  }

  return (
    <View className="mt-2 px-4 pb-4">
      {weeks.map((week) => (
        <View key={week.id} className="mb-6 bg-[#1e1e1e] rounded-xl border border-[#333333] overflow-hidden shadow-sm">
          
          {/* Table Header */}
          <View className="flex-row bg-[#252525] border-b border-[#333333]">
            <View className="flex-[0.25] p-3 justify-center border-r border-[#333333]">
              <Text className="text-white font-bold text-[12px] text-center">Date</Text>
            </View>
            <View className="flex-[0.5] p-3 justify-center border-r border-[#333333]">
              <Text className="text-white font-bold text-[12px]">Purchases</Text>
            </View>
            <View className="flex-[0.25] p-3 justify-center items-end">
              <Text className="text-white font-bold text-[12px]">Total</Text>
            </View>
          </View>

          {/* Days Rows */}
          {week.days.map((day, index) => (
            <View 
              key={day.date} 
              className={`flex-row ${index < week.days.length - 1 ? 'border-b border-[#333333]' : ''}`}
            >
              {/* Date Column */}
              <View className="flex-[0.25] p-3 justify-center items-center border-r border-[#333333] bg-[#1e1e1e]">
                <Text className="text-white font-semibold text-[12px] text-center">
                  {day.dateNum}
                </Text>
                <Text className="text-gray-400 text-[10px] text-center uppercase mt-0.5">
                  {day.weekday}
                </Text>
              </View>

              {/* Items Column */}
              <View className="flex-[0.5] p-2 justify-center border-r border-[#333333] bg-[#1e1e1e]">
                {day.items.length > 0 ? (
                  day.items.map((item, idx) => (
                    <View key={item.id || idx} className="flex-row justify-between mb-1">
                      <Text className="text-white text-[12px] flex-1 mr-2" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-gray-400 text-[12px]">
                        {Number(item.amount).toLocaleString('en-US')}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-[12px] italic">No activity</Text>
                )}
              </View>

              {/* Daily Total Column */}
              <View className="flex-[0.25] p-3 justify-center items-end bg-[#3b82f6]/10">
                <Text className={`font-bold text-[13px] ${day.total > 0 ? 'text-[#3b82f6]' : 'text-gray-500'}`}>
                  {day.total > 0 ? `₱${day.total.toLocaleString('en-US')}` : '-'}
                </Text>
              </View>
            </View>
          ))}

          {/* Weekly Total Footer */}
          <View className="flex-row bg-[#2a2a2a] border-t border-[#333333]">
            <View className="flex-[0.75] p-3 justify-center items-end border-r border-[#333333]">
              <Text className="text-white font-bold text-[14px]">Week Total</Text>
            </View>
            <View className="flex-[0.25] p-3 justify-center items-end">
              <Text className="text-[#3b82f6] font-bold text-[14px]">
                ₱{week.total.toLocaleString('en-US')}
              </Text>
            </View>
          </View>
          
        </View>
      ))}
    </View>
  );
}
