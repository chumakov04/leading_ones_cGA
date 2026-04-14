#%% md
## <a name="references"></a> References

<a name="rn"></a> [RN21] S. Russell and P. Norvig, Artificial Intelligence, Global Edition A Modern Approach. Pearson, 2021.
#%%
import numpy as np

class CGA:
    def __init__(self, vec_length: int, population_size: int):
        self.p = np.ones(vec_length, dtype=np.float32) * 0.5
        self.vec_length = vec_length
        self.n = population_size

    def generate(self) -> np.ndarray:
        return (np.random.rand(self.vec_length) < self.p).astype(int)

    def compete(self, a: np.ndarray, b: np.ndarray) -> tuple:
        score_a = 0
        for bit in a:
            if bit == 1:
                score_a += 1
            else:
                break

        score_b = 0
        for bit in b:
            if bit == 1:
                score_b += 1
            else:
                break

        return (a, b) if score_a >= score_b else (b, a)

    def update(self, winner: np.ndarray, loser: np.ndarray) -> None:
        for i in range(self.vec_length):
            if winner[i] != loser[i]:
                if winner[i] == 1:
                    self.p[i] += 1 / self.n
                else:
                    self.p[i] -= 1 / self.n
                # restrict p to [1/n, 1-1/n] so no bit is ever fully fixed
                # allows recovery from wrong decisions 
                # https://www.researchgate.net/publication/388422574_Runtime_Analysis_of_the_Compact_Genetic_Algorithm_on_the_LeadingOnes_Benchmark
                self.p[i] = max(1/self.vec_length, min(1 - 1/self.vec_length, self.p[i]))

    def has_converged(self) -> bool:
        return all(p <= 1/self.vec_length or p >= 1 - 1/self.vec_length for p in self.p)


# example
cga = CGA(vec_length=8, population_size=50)

for t in range(5000):
    a = cga.generate()
    b = cga.generate()
    winner, loser = cga.compete(a, b)
    cga.update(winner, loser)

print(f"p = {np.round(cga.p, 2)}")
print(f"solution = {(cga.p >= 0.5).astype(int)}")
