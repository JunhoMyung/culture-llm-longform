import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, FolderOpenIcon, DocumentTextIcon, MapIcon, UserIcon } from '@heroicons/react/24/outline';
import RAW_DATA from "./culture-85273-default-rtdb-export.json";


const ERROR_DEFINITIONS = {
  "Linguistic Error": {
    color: "bg-red-200 border-red-400 text-red-900"
  },
  "Cultural Error": {
    color: "bg-amber-200 border-amber-400 text-amber-900"
  },
  "Both": {
    color: "bg-purple-200 border-purple-400 text-purple-900"
  }
};

// ==========================================
// 2. 컴포넌트들
// ==========================================

// 텍스트 하이라이트 (HoverHighlight)
function HoverHighlight({ text, ann, onClick, isSelected }) {
  const style = ERROR_DEFINITIONS[ann.type]?.color || "bg-gray-200 border-gray-400";
  const activeStyle = isSelected ? "ring-2 ring-blue-500 ring-offset-1 font-bold" : "";

  return (
    <span
      className={`relative inline-block cursor-pointer px-1 mx-0.5 rounded border-b-2 transition-all duration-200 ${style} ${activeStyle} hover:brightness-95`}
      onClick={(e) => {
        e.stopPropagation();
        onClick(ann);
      }}
    >
      {text}
    </span>
  );
}

// 주석 상세 보기 패널 (오른쪽)
function AnnotationDetail({ annotation, onClose }) {
  if (!annotation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
        <DocumentTextIcon className="w-12 h-12 mb-2 opacity-20" />
        <p>Click on the highlightd spans to check the details.</p>
      </div>
    );
  }

  const def = ERROR_DEFINITIONS[annotation.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <span className={`text-xs font-bold px-2 py-1 rounded ${def?.color.split(' ')[0]} ${def?.color.split(' ')[2]}`}>
            {annotation.type}
          </span>
          <h3 className="text-xl font-bold mt-2 text-gray-800">Detail View</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded">
        <UserIcon className="w-4 h-4" />
        <span>Annotated by: <strong>{annotation.annotatorId}</strong></span>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-1">Text</h4>
        <div className="p-3 bg-gray-100 rounded-lg text-gray-800 font-medium border-l-4 border-blue-500">
          "{annotation.text}"
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 mb-1">Explanation</h4>
        <p className="text-gray-600 leading-relaxed bg-white p-3 border rounded-lg shadow-sm">
          {annotation.explanation || "(No explanation provided)"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Criticality</h4>
          <div className="text-sm px-3 py-2 bg-gray-50 rounded border">
            {annotation.criticality || "N/A"}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Ref ID</h4>
          <div className="text-sm px-3 py-2 bg-gray-50 rounded border text-gray-500">
            #{annotation.id}
          </div>
        </div>
      </div>

      {annotation.suggestion && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-1">Suggestion</h4>
          <p className="text-gray-600 bg-green-50 p-3 border border-green-200 rounded-lg">
            {annotation.suggestion}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ✨ [수정됨] 사이드바: 질문 내용을 메인으로 표시
function DataSidebar({ groupedData, selectedId, onSelect }) {
  const countries = Object.keys(groupedData).sort();

  return (
    <div className="w-80 bg-white border-r h-screen overflow-y-auto flex flex-col shadow-lg z-10 flex-shrink-0">
      <div className="p-5 border-b bg-gray-50 sticky top-0 z-10">
        <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">
          <FolderOpenIcon className="h-6 w-6 text-blue-600"/>
          Annotation Viewer
        </h1>
        <p className="text-xs text-gray-500 mt-1 pl-8">Merged by Question ID</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {countries.map((country) => (
          <div key={country} className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 uppercase tracking-wide bg-gray-100 rounded mb-1">
              <MapIcon className="w-4 h-4" />
              {country} ({groupedData[country].length})
            </div>
            <div className="pl-2 space-y-1">
              {groupedData[country].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`w-full text-left p-3 text-sm rounded transition-colors flex flex-col gap-1.5 ${
                    selectedId === item.id 
                    ? "bg-blue-50 text-blue-900 border-blue-200 ring-1 ring-blue-300 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                  }`}
                >
                  {/* 질문 텍스트 (메인) - 2줄까지만 표시 */}
                  <div className="font-bold leading-snug line-clamp-2 text-gray-800" title={item.question}>
                    {item.question}
                  </div>
                  
                  {/* ID 및 메타 정보 (서브) */}
                  <div className="flex justify-between items-center w-full pt-1 border-t border-gray-100 mt-1">
                     <span className="text-xs text-gray-400 truncate max-w-[120px] font-mono" title={item.id}>
                       {item.id}
                     </span>
                     <div className="flex gap-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider shrink-0">
                        <span title="Total Errors" className="bg-red-50 text-red-600 px-1 rounded">Err: {item.allAnnotations.length}</span>
                        <span title="Annotators Count" className="bg-blue-50 text-blue-600 px-1 rounded">Ppl: {item.annotators.size}</span>
                     </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 뷰어 본문 내용
function ViewerContent({ data }) {
  const { question, answer, allAnnotations } = data;
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);

  // [중복 처리 로직]
  // Span이 겹치면 하나만 보여주기 위해 렌더링용 주석 리스트 필터링
  const filteredAnnotations = useMemo(() => {
    // 1. 시작점 기준으로 정렬
    const sorted = [...allAnnotations].sort((a, b) => a.start - b.start);
    
    const result = [];
    let lastEnd = -1;

    for (const ann of sorted) {
      // 2. 만약 현재 주석의 시작점이 이전 주석의 끝점보다 작다면 겹치는 것임 -> 건너뜀
      if (ann.start < lastEnd) {
        continue; 
      }
      // 겹치지 않으면 추가하고 lastEnd 갱신
      result.push(ann);
      lastEnd = ann.end;
    }
    return result;
  }, [allAnnotations]);


  // 문단 분리 및 렌더링
  const paragraphs = useMemo(() => answer.split('\n\n'), [answer]);

  const renderedParagraphs = useMemo(() => {
    let currentOffset = 0;
    
    return paragraphs.map((para, pIndex) => {
      const paraStart = currentOffset;
      const paraEnd = currentOffset + para.length;
      
      const paraAnns = filteredAnnotations
        .filter(a => a.start >= paraStart && a.start < paraEnd)
        .sort((a, b) => a.start - b.start);

      let result = [];
      let lastCursor = 0; 

      paraAnns.forEach((ann, i) => {
        const localStart = ann.start - paraStart;
        const localEnd = ann.end - paraStart;

        if (localStart > lastCursor) {
          result.push(<span key={`t-${pIndex}-${i}`}>{para.slice(lastCursor, localStart)}</span>);
        }

        result.push(
          <HoverHighlight
            key={`a-${ann.uniqueId}`}
            text={para.slice(localStart, localEnd)}
            ann={ann}
            isSelected={selectedAnnotation?.uniqueId === ann.uniqueId}
            onClick={setSelectedAnnotation}
          />
        );

        lastCursor = localEnd;
      });

      if (lastCursor < para.length) {
        result.push(<span key={`end-${pIndex}`}>{para.slice(lastCursor)}</span>);
      }

      currentOffset += para.length + 2;

      return (
        <div key={pIndex} className="mb-6 leading-relaxed text-gray-800 text-lg">
          {result}
        </div>
      );
    });
  }, [paragraphs, filteredAnnotations, selectedAnnotation]);

  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-gray-50">
      {/* 중앙 본문 */}
      <div className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border p-10 min-h-full">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-10 rounded-r-md">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Question ID: {data.id}</h2>
            <p className="text-gray-900 font-bold text-xl">{question}</p>
          </div>

          <div className="prose max-w-none">
            {renderedParagraphs}
          </div>
        </div>
      </div>

      {/* 오른쪽 상세창 */}
      <div className="w-96 bg-white border-l h-screen shadow-xl p-6 overflow-y-auto flex-shrink-0 z-20">
        <AnnotationDetail 
          annotation={selectedAnnotation} 
          onClose={() => setSelectedAnnotation(null)} 
        />
      </div>
    </div>
  );
}

// ==========================================
// 3. 메인 앱 (데이터 처리 로직 포함)
// ==========================================

export default function App() {
  const processedData = useMemo(() => {
    const root = RAW_DATA?.main || {}; 
    const mergedMap = {};

    Object.keys(root).forEach(userId => {
      const userQuestions = root[userId];
      
      Object.keys(userQuestions).forEach(qId => {
        const content = userQuestions[qId];
        
        if (!mergedMap[qId]) {
          mergedMap[qId] = {
            id: qId,
            question: content.question,
            answer: content.answer,
            allAnnotations: [],
            annotators: new Set()
          };
        }

        let userAnns = [];
        if (content.annotations?.annotations) {
          const raw = content.annotations.annotations;
          userAnns = Array.isArray(raw) ? raw : Object.values(raw);
        }

        userAnns.forEach(ann => {
          if(!ann) return;
          mergedMap[qId].allAnnotations.push({
            ...ann,
            annotatorId: userId,
            uniqueId: `${userId}-${ann.id}`
          });
        });

        mergedMap[qId].annotators.add(userId);
      });
    });

    const grouped = {};
    Object.values(mergedMap).forEach(item => {
      const country = item.id.split('-')[0] || "others";
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(item);
    });

    return grouped;
  }, []);

  const [selectedItem, setSelectedItem] = useState(null);

  useMemo(() => {
    const countries = Object.keys(processedData);
    if (countries.length > 0 && !selectedItem) {
      const firstGroup = processedData[countries[0]];
      if (firstGroup.length > 0) setSelectedItem(firstGroup[0]);
    }
  }, [processedData]);

  if (Object.keys(processedData).length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">데이터가 없습니다.</h2>
        <p className="text-gray-600 mb-4"><code>RAW_DATA</code> 변수에 JSON을 붙여넣거나 import 해주세요.</p>
        <div className="bg-white p-4 rounded shadow text-xs text-gray-500 font-mono">
          const RAW_DATA = &#123; "main": ... &#125;;
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 font-sans overflow-hidden">
      <DataSidebar 
        groupedData={processedData}
        selectedId={selectedItem?.id}
        onSelect={setSelectedItem}
      />
      
      {selectedItem ? (
        <ViewerContent data={selectedItem} key={selectedItem.id} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          왼쪽 목록에서 항목을 선택해주세요.
        </div>
      )}
    </div>
  );
}