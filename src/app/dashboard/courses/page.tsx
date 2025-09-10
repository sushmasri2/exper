"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, Grid, List, ChevronDown } from "lucide-react";
import styles from "./coursepage.module.css";

export default function Courses() {
  const [view, setView] = useState("grid");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* Left Section */}
        <h2 className={styles.h2}>All Courses(466)</h2>
        <div className={styles.courseInfo}>
          {/* Search */}
          <Input
            placeholder="Search courses..."
            className="max-w-xs"
          />

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                All Courses <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Courses</DropdownMenuItem>
              <DropdownMenuItem>My Courses</DropdownMenuItem>
              <DropdownMenuItem>Completed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Sort by: Newest <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Oldest</DropdownMenuItem>
              <DropdownMenuItem>Alphabetical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Create Button */}
        <Link href="/dashboard/courses/courseBuilder">
          <Button variant="courseCreate">
            <Plus size={16} /> Create New Course
          </Button>
        </Link>

        {/* View Toggle */}
        <div className="flex items-center border rounded-lg overflow-hidden">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setView("grid")}
          >
            <Grid size={16} />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setView("list")}
          >
            <List size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
