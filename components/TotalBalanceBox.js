import AnimatedCounter from'./AnimatedCounter'
import DoughnutChart from './DoughtnutChart'
const TotalBalanceBox = ({
    accounts=[],
    totalBanks,totalCurrentBalance
}) => {
  return (
    <section className='total-balance'>
        <div className="total-balance-chart">
            {
                <DoughnutChart
                accounts={accounts}
                />
            }
            <div className="flex flex-xol gap-6">
                <h2 className="header-2">
                Credit  {totalBanks} 
                </h2>
                <div className="flex flex-col gap-2">
                    <p className="total-balance-label">
                        Total Credit Balance
                    </p>
                    <div className="total-balance-amount flex-center gap-2">
                        <AnimatedCounter amount={totalCurrentBalance}/>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default TotalBalanceBox