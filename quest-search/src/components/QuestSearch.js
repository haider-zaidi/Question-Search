import { useState, useEffect } from "react"
// import { questions } from "../lib/mock-data"
import { SearchInput } from "./SearchInput"
import { QuestionCard } from "./QuestionCard"
import { Pagination } from "./Pagination"

export default function QuestSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [filteredQuestions, setFilteredQuestions] = useState([])
  const questionsPerPage = 5
  
  // useEffect(() => {
  //   const searchQuestions = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:3001/api/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage}&pageSize=10`)
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok")
  //       }
  //       const data = await response.json()
  //       setFilteredQuestions(data.questions || [])
  //       // setTotalPages(Math.ceil(data.total / 10))
  //     } catch (error) {
  //       console.error("Error searching questions:", error)
  //     }
  //   }
    
  //   // const searchTerm = searchQuery.toLowerCase().trim()
  //   // const filtered = questions.filter((question) => {
  //   //   const matchesTitle = question.title.toLowerCase().includes(searchTerm)
  //   //   const matchesType = question.type.toLowerCase().includes(searchTerm)
  //   //   const matchesAnagramType = question.anagramType 
  //   //     ? question.anagramType.toLowerCase().includes(searchTerm)
  //   //     : false
      
  //   //   return matchesTitle || matchesType || matchesAnagramType
  //   // })
  //   searchQuestions();
  //   // setFilteredQuestions(filtered)
  //   setCurrentPage(1)
  // }, [searchQuery,currentPage])
  useEffect(() => {
    const controller = new AbortController()
  
    const searchQuestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/search?query=${encodeURIComponent(searchQuery)}&page=${currentPage}&pageSize=${questionsPerPage}`,
          { signal: controller.signal }
        )
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        const data = await response.json()
        setFilteredQuestions(data.questions || []) // Ensure it's an array
        // setTotalPages(Math.ceil(data.total / questionsPerPage))
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error searching questions:", error)
        }
      }
    }
  
    searchQuestions()
  
    return () => controller.abort()
  }, [searchQuery, currentPage, questionsPerPage])
  
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage)
  const startIndex = (currentPage - 1) * questionsPerPage
  const displayedQuestions = filteredQuestions.slice(startIndex, startIndex + questionsPerPage)

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Add type counts for showing results summary
  const getTypeCount = (type) => {
    return filteredQuestions.filter(q => q.type === type).length
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">Question Search</h1>
          <SearchInput 
            value={searchQuery} 
            onChange={handleSearch}
            placeholder="Search by title or type (e.g., ANAGRAM, MCQ, READ_ALONG)"
          />
          
          {/* Show search results summary */}
          {searchQuery && (
            <div className="mt-2 text-sm text-muted-foreground">
              Found {filteredQuestions.length} results
              {searchQuery && (
                <span className="ml-1">
                  (ANAGRAM: {getTypeCount('ANAGRAM')}, 
                  MCQ: {getTypeCount('MCQ')}, 
                  READ_ALONG: {getTypeCount('READ_ALONG')})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {displayedQuestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions found matching your search.
            </div>
          ) : (
            displayedQuestions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))
          )}
        </div>

        {filteredQuestions.length > questionsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}