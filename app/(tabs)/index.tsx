import { StatusBar } from 'expo-status-bar';
import { addDoc, collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { PieChart } from "react-native-chart-kit";
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 📅 HELPER: Get Month Key
const getMonthKey = (timestamp: number) => {
  const d = new Date(timestamp);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${m}-${d.getFullYear()}`;
};

const getDisplayMonth = (timestamp: number) => {
  const d = new Date(timestamp);
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${m}/${d.getFullYear()}`;
};

export default function HomeScreen() {

  const [user, setUser] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Expense states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState("other");
  const [expenses, setExpenses] = useState([]);

  // Budget states
  const [budgetInput, setBudgetInput] = useState('');
  const [currentBudget, setCurrentBudget] = useState(null);

  const screenWidth = Dimensions.get("window").width;
  const currentMonthKey = getMonthKey(Date.now());
  const displayMonth = getDisplayMonth(Date.now());

  // 🎯 CATEGORY COLORS
  const categoryColors = {
    food: "#FF6B6B",
    travel: "#4ECDC4",
    shopping_need: "#4CAF50",
    shopping_want: "#F72585",
    other: "#A29BFE"
  };

  const categoryLabels = {
    food: "Food",
    travel: "Travel",
    shopping_need: "Need",
    shopping_want: "Want",
    other: "Other"
  };

  // 🔁 REALTIME FIREBASE LISTENER
  useEffect(() => {
    let unsubscribeExpenses;
    let unsubscribeBudget;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setExpenses([]);
        setCurrentBudget(null);
        setLoadingData(false);
        if (unsubscribeExpenses) unsubscribeExpenses();
        if (unsubscribeBudget) unsubscribeBudget();
        return;
      }

      setLoadingData(true);

      unsubscribeExpenses = onSnapshot(
        collection(db, "users", currentUser.uid, "expenses"),
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setExpenses(data);
          setLoadingData(false);
        }
      );

      const budgetRef = doc(db, "users", currentUser.uid, "budgets", currentMonthKey);
      unsubscribeBudget = onSnapshot(budgetRef, (docSnap) => {
        if (docSnap.exists()) {
          setCurrentBudget(docSnap.data().amount);
        } else {
          setCurrentBudget(null);
        }
      });
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeExpenses) unsubscribeExpenses();
        if (unsubscribeBudget) unsubscribeBudget();
    };
  }, []);

  // ➕ ADD EXPENSE
  const handleAddExpense = async () => {
    if (!title || !amount || !user) return;

    const newExpense = {
      title,
      amount: Number(amount),
      category,
      createdAt: Date.now()
    };

    try {
      await addDoc(
        collection(db, "users", user.uid, "expenses"),
        newExpense
      );
    } catch (err) {
      console.log("Firebase error:", err);
    }

    setTitle('');
    setAmount('');
  };

  // 💰 SET BUDGET
  const handleSetBudget = async () => {
    if (!budgetInput || !user) return;

    const amountNum = Number(budgetInput);

    try {
      const budgetRef = doc(db, "users", user.uid, "budgets", currentMonthKey);
      await setDoc(budgetRef, {
        amount: amountNum,
        month: displayMonth,
        monthKey: currentMonthKey,
        createdAt: Date.now()
      }, { merge: true });
    } catch (err) {
      console.log("Firebase error:", err);
    }
    
    setBudgetInput('');
  };

  const spentThisMonth = expenses
    .filter(e => getMonthKey(e.createdAt) === currentMonthKey)
    .reduce((sum, e) => sum + e.amount, 0);

  const percentage = currentBudget
    ? Math.min((spentThisMonth / currentBudget) * 100, 100)
    : 0;

  let progressColor = "#4CAF50"; // green
  if (percentage > 80) progressColor = "#FF4D4D";
  else if (percentage > 50) progressColor = "#FFD93D";

  // 📊 CATEGORY TOTALS
  const categoryTotals = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const need = categoryTotals["shopping_need"] || 0;
  const want = categoryTotals["shopping_want"] || 0;

  let behaviorInsight = "";
  if (want > need * 1.5) {
    behaviorInsight = "⚠️ Wants are dominating your spending";
  } else if (want > need) {
    behaviorInsight = "⚠️ You're spending more on wants";
  } else {
    behaviorInsight = "✅ Good balance between needs & wants";
  }

  let budgetAlert = "";
  if (!currentBudget) {
    budgetAlert = "Set a budget to unlock smart insights 🚀";
  } else {
    if (spentThisMonth > currentBudget) {
      budgetAlert = "🚨 Budget exceeded";
    } else if (percentage > 80) {
      budgetAlert = "⚠️ Almost there — slow down";
    } else if (percentage < 50) {
      budgetAlert = "✅ You're in control";
    } else {
      budgetAlert = "✅ You're managing your budget well";
    }
  }

  const chartData = expenses.map(item => ({
    name: item.title,
    amount: item.amount,
    color: categoryColors[item.category] || "#ccc",
    legendFontColor: "#fff",
    legendFontSize: 12
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B132B' }}>
      <StatusBar style="light" />

      <ScrollView>
        {/* HEADER */}
        <View style={{ padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>
            OrbytOS 🚀
          </Text>
          <Text style={{ color: '#6FFFE9', marginTop: 5 }}>
            Your personal finance orbit
          </Text>
        </View>

        {loadingData ? (
          <ActivityIndicator size="large" color="#6FFFE9" style={{ marginTop: 20 }} />
        ) : (
          <>
            {/* BUDGET DASHBOARD */}
            <View style={{
              marginHorizontal: 20,
              padding: 20,
              borderRadius: 20,
              backgroundColor: '#1C2541'
            }}>
              <Text style={{ color: '#aaa', fontSize: 16 }}>This Month ({displayMonth})</Text>
              
              <View style={{ marginTop: 15, marginBottom: 15 }}>
                <Text style={{ color: '#fff', fontSize: 16 }}>💰 Budget: ₹{currentBudget || 0}</Text>
                <Text style={{ color: '#fff', fontSize: 16 }}>💸 Spent: ₹{spentThisMonth}</Text>
                {currentBudget && (
                  <Text style={{ color: '#6FFFE9', fontSize: 16, fontWeight: 'bold', marginTop: 5 }}>
                    🟢 Remaining: ₹{Math.max(currentBudget - spentThisMonth, 0)}
                  </Text>
                )}
              </View>

              {/* PROGRESS BAR */}
              {currentBudget && (
                <View style={{ height: 10, backgroundColor: '#0B132B', borderRadius: 5, overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: progressColor }} />
                </View>
              )}

              {/* SET BUDGET INPUT */}
              <View style={{ flexDirection: 'row', marginTop: 20, alignItems: 'center' }}>
                <TextInput
                  placeholder="Set Monthly Budget"
                  placeholderTextColor="#888"
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                  style={{
                    flex: 1,
                    backgroundColor: '#0B132B',
                    color: '#fff',
                    padding: 12,
                    borderRadius: 10,
                    marginRight: 10
                  }}
                />
                <TouchableOpacity
                  onPress={handleSetBudget}
                  style={{
                    backgroundColor: '#6FFFE9',
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: '#0B132B', fontWeight: 'bold' }}>Set</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* INSIGHTS */}
            <View style={{
              margin: 20,
              padding: 15,
              borderRadius: 15,
              backgroundColor: '#16213E'
            }}>
              <Text style={{ color: '#FFD93D', fontWeight: 'bold', marginBottom: 5 }}>{budgetAlert}</Text>
              <Text style={{ color: '#F72585' }}>🧠 {behaviorInsight}</Text>
            </View>

            {/* PIE CHART */}
            {expenses.length > 0 && (
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <PieChart
                  data={chartData}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={{
                    backgroundColor: "#0B132B",
                    backgroundGradientFrom: "#0B132B",
                    backgroundGradientTo: "#0B132B",
                    color: () => "#fff"
                  }}
                  accessor={"amount"}
                  backgroundColor={"transparent"}
                  paddingLeft={"10"}
                />
              </View>
            )}

            {/* ADD EXPENSE */}
            <View style={{
              marginHorizontal: 20,
              marginBottom: 40,
              padding: 20,
              borderRadius: 20,
              backgroundColor: '#1C2541'
            }}>
              <Text style={{ color: '#6FFFE9', marginBottom: 10, fontWeight: 'bold', fontSize: 16 }}>
                Add Expense
              </Text>

              <TextInput
                placeholder="Title"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                style={{
                  backgroundColor: '#0B132B',
                  color: '#fff',
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10
                }}
              />

              <TextInput
                placeholder="Amount"
                placeholderTextColor="#888"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={{
                  backgroundColor: '#0B132B',
                  color: '#fff',
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 10
                }}
              />

              {/* CATEGORY BUTTONS */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {Object.keys(categoryLabels).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={{
                      backgroundColor: category === cat ? categoryColors[cat] : '#0B132B',
                      padding: 8,
                      borderRadius: 8,
                      margin: 5
                    }}>
                    <Text style={{ color: category === cat ? '#000' : '#fff' }}>
                      {categoryLabels[cat]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleAddExpense}
                style={{
                  backgroundColor: '#6FFFE9',
                  padding: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginTop: 15
                }}
              >
                <Text style={{ color: '#0B132B', fontWeight: 'bold' }}>
                  Add Expense
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}