import React, { useState } from "react";
import type { MultiFilters, AccordionState, Subcategory } from "../types";
import Card from "./ui/Card";

interface FilterProps {
    filters: MultiFilters;
    setFilters: React.Dispatch<React.SetStateAction<MultiFilters>>;
    subcategoriesByParent: Map<string, Subcategory[]>;
    uniqueValues: {
        colors: string[];
        materials: string[];
        patterns: string[];
        seasons: string[];
        tpos: string[];
    };
}

export default function Filter({
    filters,
    setFilters,
    subcategoriesByParent,
    uniqueValues,
}: FilterProps) {
    const [accordion, setAccordion] = useState<AccordionState>({
        color: false,
        material: false,
        pattern: false,
        season_tag: false,
        tpo_tags: false,
    });

    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const toggleFilterArray = (key: keyof MultiFilters, value: string | number) => {
        const arr = filters[key] as any[];
        if (arr.includes(value)) setFilters({ ...filters, [key]: arr.filter((v) => v !== value) });
        else setFilters({ ...filters, [key]: [...arr, value] });
    };

    const toggleAccordion = (key: keyof AccordionState) =>
        setAccordion((prev) => ({ ...prev, [key]: !prev[key] }));

    const renderCheckboxSection = (
        label: string,
        key: keyof AccordionState,
        options: { id: string | number; name: string }[],
        filterKey: keyof MultiFilters
    ) => (
        <div className="mb-3 border border-gray-300 dark:border-white/20 rounded-lg p-2">
            <button
                type="button"
                className="flex justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-100 border border-gray-300 dark:border-white/20 rounded-md px-2 py-1"
                onClick={() => toggleAccordion(key)}
            >
                <span>{label}</span>
                <span>{accordion[key] ? "-" : "+"}</span>
            </button>
            {accordion[key] && (
                <div className="pl-2 mt-1 space-y-1 max-h-48 overflow-y-auto">
                    {options.map((opt) => (
                        <label key={opt.id} className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={(filters[filterKey] as any[]).includes(opt.id)}
                                onChange={() => toggleFilterArray(filterKey, opt.id)}
                            />
                            <span className="text-slate-800 dark:text-slate-100">{opt.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Card>
            <h4 className="text-lg font-semibold mb-3">フィルター</h4>

            {/* カテゴリー */}
            <div className="mb-3 border border-gray-300 dark:border-white/20 rounded-lg p-2">
                <button
                    type="button"
                    className="flex justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-100 border border-gray-300 dark:border-white/20 rounded-md px-2 py-1"
                    onClick={() => setExpandedCategory(expandedCategory ? null : "category")}
                >
                    <span>カテゴリー</span>
                    <span>{expandedCategory ? "-" : "+"}</span>
                </button>
                {expandedCategory && (
                    <div className="pl-2 mt-1">
                        {["服", "靴", "アクセサリー", "帽子", "バッグ"].map((parent) => (
                            <div key={parent} className="mb-1 border border-gray-300 dark:border-white/20 rounded-md p-1">
                                <button
                                    type="button"
                                    className="flex justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-100 border border-gray-300 dark:border-white/20 rounded-md px-2 py-1"
                                    onClick={() =>
                                        setExpandedCategory(expandedCategory === parent ? null : parent)
                                    }
                                >
                                    <span>{parent}</span>
                                    <span>{expandedCategory === parent ? "-" : "+"}</span>
                                </button>
                                {expandedCategory === parent && (
                                    <div className="pl-4 mt-1">
                                        {subcategoriesByParent.get(parent)?.map((s) => (
                                            <label key={s.subcategory_id} className="flex items-center text-sm mb-1">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={filters.subcategory_ids.includes(s.subcategory_id)}
                                                    onChange={() => toggleFilterArray("subcategory_ids", s.subcategory_id)}
                                                />
                                                <span className="text-slate-800 dark:text-slate-100">{s.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 色・素材・柄・季節・TPO */}
            {renderCheckboxSection(
                "色",
                "color",
                uniqueValues.colors.map((v) => ({ id: v, name: v })),
                "color"
            )}
            {renderCheckboxSection(
                "素材",
                "material",
                uniqueValues.materials.map((v) => ({ id: v, name: v })),
                "material"
            )}
            {renderCheckboxSection(
                "柄",
                "pattern",
                uniqueValues.patterns.map((v) => ({ id: v, name: v })),
                "pattern"
            )}
            {renderCheckboxSection(
                "季節",
                "season_tag",
                uniqueValues.seasons.map((v) => ({ id: v, name: v })),
                "season_tag"
            )}
            {renderCheckboxSection(
                "TPO",
                "tpo_tags",
                uniqueValues.tpos.map((v) => ({ id: v, name: v })),
                "tpo_tags"
            )}
        </Card>
    );
}
