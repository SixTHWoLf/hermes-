import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import React from "react"
import {
  DataTableContent,
  DataTableToolbar,
  DataTablePagination,
  DataTableCheckbox,
  useDataTable,
  type ColumnDef,
} from "@/components/ui/data-table"

// Test data type
interface TestUser {
  id: string
  name: string
  email: string
  age: number
  role: "admin" | "user" | "guest"
}

// Test columns
const testColumns: ColumnDef<TestUser, unknown>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <DataTableCheckbox
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <DataTableCheckbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        aria-label={`Select ${row.original.name}`}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({ row }) => <span>{row.original.age}</span>,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <span>{row.original.role}</span>,
  },
]

// Test data
const testData: TestUser[] = [
  { id: "1", name: "Alice", email: "alice@example.com", age: 28, role: "admin" },
  { id: "2", name: "Bob", email: "bob@example.com", age: 34, role: "user" },
  { id: "3", name: "Charlie", email: "charlie@example.com", age: 22, role: "guest" },
  { id: "4", name: "Diana", email: "diana@example.com", age: 31, role: "user" },
  { id: "5", name: "Eve", email: "eve@example.com", age: 25, role: "admin" },
]

// Wrapper component for testing useDataTable hook
function TestWrapper({
  data,
  columns,
  enableRowSelection = false,
}: {
  data: TestUser[]
  columns: ColumnDef<TestUser, unknown>[]
  enableRowSelection?: boolean
}) {
  const { table } = useDataTable({
    data,
    columns,
    options: {
      enableRowSelection,
      initialPagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  return (
    <div>
      <DataTableToolbar table={table} searchKey="name" />
      <DataTableContent table={table} />
      <DataTablePagination table={table} />
    </div>
  )
}

describe("DataTable", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("DataTableContent", () => {
    it("should render table headers", () => {
      render(<TestWrapper data={testData} columns={testColumns} />)

      expect(screen.getByText("Name")).toBeInTheDocument()
      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByText("Age")).toBeInTheDocument()
      expect(screen.getByText("Role")).toBeInTheDocument()
    })

    it("should render all data rows", () => {
      render(<TestWrapper data={testData} columns={testColumns} />)

      expect(screen.getByText("Alice")).toBeInTheDocument()
      expect(screen.getByText("Bob")).toBeInTheDocument()
      expect(screen.getByText("Charlie")).toBeInTheDocument()
      expect(screen.getByText("Diana")).toBeInTheDocument()
      expect(screen.getByText("Eve")).toBeInTheDocument()
    })

    it("should show loading state", () => {
      function LoadingWrapper() {
        const { table } = useDataTable({
          data: testData,
          columns: testColumns,
        })
        return <DataTableContent table={table} loading={true} />
      }

      render(<LoadingWrapper />)
      expect(screen.getByText("Loading...")).toBeInTheDocument()
    })

    it("should show no results message when data is empty", () => {
      function EmptyWrapper() {
        const { table } = useDataTable({
          data: [],
          columns: testColumns,
        })
        return <DataTableContent table={table} />
      }

      render(<EmptyWrapper />)
      expect(screen.getByText("No results.")).toBeInTheDocument()
    })
  })

  describe("DataTablePagination", () => {
    it("should render pagination controls", () => {
      render(<TestWrapper data={testData} columns={testColumns} />)

      expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument()
    })
  })

  describe("DataTableCheckbox", () => {
    it("should render checkbox with correct attributes", () => {
      render(
        <DataTableCheckbox
          checked={false}
          onChange={() => {}}
          aria-label="Select row"
        />
      )

      const checkbox = screen.getByLabelText("Select row")
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).toHaveAttribute("type", "checkbox")
    })

    it("should handle checked state", () => {
      const handleChange = vi.fn()
      render(
        <DataTableCheckbox
          checked={true}
          onChange={handleChange}
          aria-label="Select row"
        />
      )

      const checkbox = screen.getByLabelText("Select row")
      expect(checkbox).toBeChecked()
    })
  })
})
