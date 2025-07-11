"use client"

import { useState, useEffect } from "react"
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import TopNav from "@/components/top-nav"
import AddFundsModal from "@/components/add-funds-modal"
import { useToast } from "@/hooks/use-toast"

export default function WalletScreen({ user, onNavigate }) {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [showBalance, setShowBalance] = useState(true)
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchWalletData()
    fetchTransactions()
  }, [user.id])

  const fetchWalletData = async () => {
    const { data } = await supabase.from("wallets").select("balance").eq("user_id", user.id).single()
    if (data) setBalance(data.balance)
  }

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select(`
        id,
        amount,
        timestamp,
        resource_id,
        resources (title)
      `)
      .eq("buyer_id", user.id)
      .order("timestamp", { ascending: false })
      .limit(10)

    if (data) setTransactions(data)
  }

  const handleAddFunds = async (amount, method) => {
    setLoading(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const { error } = await supabase
        .from("wallets")
        .update({ balance: balance + amount })
        .eq("user_id", user.id)

      if (error) throw error

      setBalance(balance + amount)
      setShowAddFundsModal(false)

      toast({
        title: "💰 Funds Added Successfully!",
        description: `₦${amount.toLocaleString()} has been added to your wallet via ${method}.`,
      })
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav title="Wallet" showBack onBack={() => onNavigate("home")} />

      <div className="p-6 space-y-6">
        {/* Balance Card */}
        <Card className="bg-slate-900 text-white rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Available Balance</p>
                  <p className="text-white font-medium">Qitt Wallet</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </Button>
            </div>

            <div className="mb-6">
              <h2 className="text-4xl font-bold mb-2">{showBalance ? `₦${balance.toLocaleString()}` : "₦••••••"}</h2>
              <div className="flex items-center space-x-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+12.5% this month</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowAddFundsModal(true)}
                className="flex-1 bg-white text-slate-900 hover:bg-gray-100 rounded-xl h-12 font-semibold"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl h-12 font-semibold bg-transparent"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="rounded-xl bg-white">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ArrowDownLeft className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₦12K</p>
              <p className="text-xs text-gray-600">Added</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <ArrowUpRight className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">₦8K</p>
              <p className="text-xs text-gray-600">Spent</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl bg-white">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-xs text-gray-600">Transactions</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="rounded-2xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 rounded-lg">
                View All
              </Button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
                <p className="text-gray-600 mb-4">Your purchase history will appear here</p>
                <Button onClick={() => onNavigate("explore")} className="bg-blue-500 hover:bg-blue-600 text-white">
                  Explore Resources
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{transaction.resources.title}</p>
                        <p className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-bold">-₦{transaction.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Funds Modal */}
      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        onAddFunds={handleAddFunds}
        loading={loading}
      />
    </div>
  )
}
